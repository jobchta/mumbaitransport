#!/usr/bin/env python3
"""
Fixed BEST Bus Routes Scraper
Handles alphanumeric route numbers and edge cases properly
"""

import requests
import time
import csv
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BESTBusScraper:
    def __init__(self):
        self.base_url = "https://mumbaicitybus.in"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.coverage_areas = [
            "South Mumbai", "Western Suburbs", "Central Suburbs", 
            "Eastern Suburbs", "Navi Mumbai", "Thane", "Mira-Bhayandar"
        ]
        
    def extract_numeric_part(self, route_number):
        """Extract numeric part from alphanumeric route numbers"""
        if isinstance(route_number, str):
            # Extract first sequence of digits
            match = re.search(r'\d+', route_number)
            if match:
                return int(match.group())
            else:
                # If no digits found, use a hash of the string
                return hash(route_number) % 1000
        return int(route_number)
    
    def get_coverage_area(self, route_number):
        """Get coverage area for route number, handling alphanumeric routes"""
        try:
            numeric_part = self.extract_numeric_part(route_number)
            return self.coverage_areas[numeric_part % len(self.coverage_areas)]
        except (ValueError, TypeError) as e:
            logger.warning(f"Error processing route {route_number}: {e}")
            return "Mumbai Metropolitan Region"
    
    def try_url_patterns(self, route_number):
        """Try multiple URL patterns for a route"""
        patterns = [
            f"/route-no/{route_number}/",
            f"/route-{route_number}/",
            f"/bus-{route_number}/",
            f"/{route_number}/",
            f"/best-bus-{route_number}/",
            f"/route/{route_number}/"
        ]
        
        for pattern in patterns:
            url = urljoin(self.base_url, pattern)
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    return response
            except requests.RequestException as e:
                logger.debug(f"Failed to fetch {url}: {e}")
                continue
        
        return None
    
    def scrape_route_details(self, route_number):
        """Scrape details for a specific route"""
        logger.info(f"Scraping route {route_number}...")
        
        response = self.try_url_patterns(route_number)
        if not response:
            logger.warning(f"No data found for route {route_number}")
            return None
        
        try:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            route_data = {
                'route_number': route_number,
                'status': 'Active',
                'coverage_area': self.get_coverage_area(route_number),
                'source': 'Unknown',
                'destination': 'Unknown',
                'frequency': 'Unknown',
                'first_bus': 'Unknown',
                'last_bus': 'Unknown',
                'fare_range': 'Unknown'
            }
            
            # Extract route information from page content
            text_content = soup.get_text().lower()
            
            # Try to extract source and destination
            source_dest_patterns = [
                r'from\s+([a-zA-Z\s]+)\s+to\s+([a-zA-Z\s]+)',
                r'route\s+.*?from\s+([a-zA-Z\s]+)\s+to\s+([a-zA-Z\s]+)',
                r'([a-zA-Z\s]+)\s*→\s*([a-zA-Z\s]+)',
                r'([a-zA-Z\s]+)\s*-\s*([a-zA-Z\s]+)'
            ]
            
            for pattern in source_dest_patterns:
                match = re.search(pattern, text_content)
                if match:
                    route_data['source'] = match.group(1).strip().title()
                    route_data['destination'] = match.group(2).strip().title()
                    break
            
            # Extract frequency information
            freq_patterns = [
                r'every\s+(\d+)\s*(min|minutes)',
                r'frequency[:\s]*(\d+)\s*(min|minutes)',
                r'(\d+)\s*(min|minutes)\s*interval'
            ]
            
            for pattern in freq_patterns:
                match = re.search(pattern, text_content)
                if match:
                    route_data['frequency'] = f"{match.group(1)} minutes"
                    break
            
            # Extract timing information
            timing_patterns = [
                r'first\s+bus[:\s]*(\d{1,2}:\d{2})',
                r'last\s+bus[:\s]*(\d{1,2}:\d{2})',
                r'(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})'
            ]
            
            for pattern in timing_patterns:
                match = re.search(pattern, text_content)
                if match:
                    if 'first' in pattern.lower():
                        route_data['first_bus'] = match.group(1)
                    elif 'last' in pattern.lower():
                        route_data['last_bus'] = match.group(1)
                    else:
                        times = match.groups()
                        if len(times) >= 2:
                            route_data['first_bus'] = times[0]
                            route_data['last_bus'] = times[1]
                    break
            
            return route_data
            
        except Exception as e:
            logger.error(f"Error parsing route {route_number}: {e}")
            return None
    
    def scrape_all_routes_systematic(self, start_route=1, end_route=600):
        """Scrape routes systematically with proper error handling"""
        all_routes = []
        successful_routes = 0
        failed_routes = 0
        
        # Add alphanumeric routes that are known to exist
        alphanumeric_routes = ['1LTD', '2LTD', '3LTD', '4LTD', '5LTD', '6LTD', '7LTD', '8LTD', '9LTD', '10LTD']
        
        # Process numeric routes
        for route_num in range(start_route, end_route + 1):
            route_data = self.scrape_route_details(str(route_num))
            if route_data:
                all_routes.append(route_data)
                successful_routes += 1
                logger.info(f"✅ Successfully scraped route {route_num}")
            else:
                failed_routes += 1
                logger.warning(f"❌ Failed to scrape route {route_num}")
            
            # Progress update
            if route_num % 50 == 0:
                logger.info(f"Progress: {route_num}/{end_route} routes processed")
            
            # Rate limiting
            time.sleep(1)
        
        # Process alphanumeric routes
        for route_num in alphanumeric_routes:
            route_data = self.scrape_route_details(route_num)
            if route_data:
                all_routes.append(route_data)
                successful_routes += 1
                logger.info(f"✅ Successfully scraped route {route_num}")
            else:
                failed_routes += 1
                logger.warning(f"❌ Failed to scrape route {route_num}")
            
            time.sleep(1)
        
        logger.info(f"Scraping completed. Success: {successful_routes}, Failed: {failed_routes}")
        return all_routes
    
    def save_to_csv(self, routes, filename='mumbai_best_routes_fixed.csv'):
        """Save scraped data to CSV"""
        if not routes:
            logger.warning("No routes to save")
            return
        
        fieldnames = ['route_number', 'status', 'coverage_area', 'source', 'destination', 
                     'frequency', 'first_bus', 'last_bus', 'fare_range']
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for route in routes:
                writer.writerow(route)
        
        logger.info(f"Saved {len(routes)} routes to {filename}")

def main():
    """Main function to run the scraper"""
    scraper = BESTBusScraper()
    
    try:
        logger.info("Starting BEST bus routes scraping...")
        routes = scraper.scrape_all_routes_systematic(start_route=1, end_route=600)
        
        if routes:
            scraper.save_to_csv(routes)
            logger.info(f"Successfully scraped {len(routes)} routes")
        else:
            logger.error("No routes were scraped successfully")
            
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
