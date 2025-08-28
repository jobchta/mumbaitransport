#!/bin/bash

# 🚀 Mumbai Transport - Automated Deployment Script
# This script helps deploy the website to various platforms

echo "🚀 Mumbai Transport - Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "Dependencies check passed"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."

    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi

    # Check if already logged in
    if ! vercel whoami &> /dev/null; then
        print_warning "Please login to Vercel first:"
        echo "Run: vercel login"
        echo "Then run this script again"
        exit 1
    fi

    # Deploy
    print_status "Deploying to production..."
    vercel --prod

    if [ $? -eq 0 ]; then
        print_success "Successfully deployed to Vercel!"
        print_status "Get your deployment URL from the Vercel dashboard"
    else
        print_error "Vercel deployment failed"
        exit 1
    fi
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."

    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi

    # Check if already logged in
    if ! railway whoami &> /dev/null; then
        print_warning "Please login to Railway first:"
        echo "Run: railway login"
        echo "Then run this script again"
        exit 1
    fi

    # Deploy
    print_status "Deploying to Railway..."
    railway deploy

    if [ $? -eq 0 ]; then
        print_success "Successfully deployed to Railway!"
        print_status "Get your deployment URL from the Railway dashboard"
    else
        print_error "Railway deployment failed"
        exit 1
    fi
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."

    if ! command -v netlify &> /dev/null; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi

    # Check if already logged in
    if ! netlify status &> /dev/null; then
        print_warning "Please login to Netlify first:"
        echo "Run: netlify login"
        echo "Then run this script again"
        exit 1
    fi

    # Deploy
    print_status "Deploying to Netlify..."
    netlify deploy --prod --dir .

    if [ $? -eq 0 ]; then
        print_success "Successfully deployed to Netlify!"
        print_status "Get your deployment URL from the Netlify dashboard"
    else
        print_error "Netlify deployment failed"
        exit 1
    fi
}

# Test the deployment
test_deployment() {
    print_status "Testing deployment..."

    # Check if server starts
    print_status "Testing server startup..."
    timeout 10s npm start &
    SERVER_PID=$!

    sleep 5

    # Test health endpoint
    if curl -s http://localhost:3001/api/health > /dev/null; then
        print_success "Server health check passed"
    else
        print_error "Server health check failed"
    fi

    # Kill test server
    kill $SERVER_PID 2>/dev/null

    print_success "Deployment test completed"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose deployment platform:"
    echo "1) Vercel (Recommended)"
    echo "2) Railway"
    echo "3) Netlify"
    echo "4) Test Local Deployment"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
}

# Main function
main() {
    check_dependencies

    while true; do
        show_menu

        case $choice in
            1)
                deploy_vercel
                break
                ;;
            2)
                deploy_railway
                break
                ;;
            3)
                deploy_netlify
                break
                ;;
            4)
                test_deployment
                ;;
            5)
                print_status "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please select 1-5."
                ;;
        esac
    done

    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Get your deployment URL from the platform dashboard"
    echo "2. Point mumbaitransport.in domain to your deployment URL"
    echo "3. Test all functionality using the checklist in DEPLOYMENT_README.md"
    echo ""
    echo "Your live URL will be:"
    echo "https://mumbaitransport.in/portal/?embed=1&mode=metro&section=map"
}

# Run main function
main