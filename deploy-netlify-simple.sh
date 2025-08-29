#!/bin/bash

# Simple Netlify Deployment Script for Mumbai Transport
echo "🚀 Mumbai Transport - Netlify Deployment"
echo "========================================"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify (if not already logged in)
echo "Checking Netlify login..."
if ! netlify status &> /dev/null; then
    echo "Please login to Netlify:"
    netlify login
fi

echo "🚀 Starting deployment..."
echo "Repository: https://github.com/jobchta/mumbaitransport"
echo "Branch: main"
echo ""

# Deploy to Netlify
netlify deploy --prod --dir .

echo ""
echo "✅ Deployment complete!"
echo "Check your Netlify dashboard for the live URL."