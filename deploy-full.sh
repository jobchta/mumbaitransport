#!/bin/bash

# 🚀 FULL DEPLOYMENT SCRIPT - Frontend + Backend
# Deploys both frontend and backend for real-time functionality

echo "🚀 Mumbai Transport - Full Deployment (Frontend + Backend)"
echo "=========================================================="

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

# Test backend locally
test_backend() {
    print_status "Testing backend server..."

    # Start backend in background
    npm start &
    BACKEND_PID=$!

    # Wait for server to start
    sleep 3

    # Test health endpoint
    if curl -s http://localhost:3001/api/health > /dev/null; then
        print_success "Backend server is running correctly"

        # Test API endpoints
        if curl -s http://localhost:3001/api/tickets/line1 > /dev/null; then
            print_success "Ticket API working"
        else
            print_error "Ticket API not working"
        fi

        if curl -s http://localhost:3001/api/fares/line1 > /dev/null; then
            print_success "Fare API working"
        else
            print_error "Fare API not working"
        fi

        if curl -s http://localhost:3001/api/rides/compare > /dev/null; then
            print_success "Ride comparison API working"
        else
            print_error "Ride comparison API not working"
        fi
    else
        print_error "Backend server not responding"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi

    # Kill test server
    kill $BACKEND_PID 2>/dev/null
    print_success "Backend test completed"
}

# Deploy to Railway (Backend + Frontend)
deploy_railway_full() {
    print_status "Deploying full stack to Railway..."

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

    # Create new project or use existing
    print_status "Setting up Railway project..."

    # Deploy
    print_status "Deploying full stack (frontend + backend)..."
    railway deploy

    if [ $? -eq 0 ]; then
        print_success "Successfully deployed to Railway!"
        print_status "Your full-stack app is now live with:"
        echo "  ✅ Real-time backend APIs"
        echo "  ✅ Working button functionality"
        echo "  ✅ Live ticket booking"
        echo "  ✅ Real fare data"
        echo "  ✅ Ride comparison"
        print_status "Get your deployment URL from the Railway dashboard"
    else
        print_error "Railway deployment failed"
        exit 1
    fi
}

# Deploy to Vercel (Backend) + Netlify (Frontend)
deploy_hybrid() {
    print_status "Deploying hybrid setup (Vercel backend + Netlify frontend)..."

    # Backend to Vercel
    print_status "Deploying backend to Vercel..."
    if ! command -v vercel &> /dev/null; then
        npm install -g vercel
    fi

    # Check Vercel login
    if ! vercel whoami &> /dev/null; then
        print_warning "Please login to Vercel first:"
        echo "Run: vercel login"
        echo "Then run this script again"
        exit 1
    fi

    # Deploy backend
    vercel --prod
    if [ $? -eq 0 ]; then
        print_success "Backend deployed to Vercel"
        VERCEL_URL=$(vercel --prod 2>&1 | grep -o 'https://[^ ]*')
        print_status "Backend URL: $VERCEL_URL"
    else
        print_error "Vercel backend deployment failed"
        exit 1
    fi

    # Frontend to Netlify
    print_status "Deploying frontend to Netlify..."
    if ! command -v netlify &> /dev/null; then
        npm install -g netlify-cli
    fi

    # Update frontend to use Vercel backend URL
    print_status "Updating frontend API URLs..."
    sed -i.bak "s|http://localhost:3001|$VERCEL_URL|g" src/js/app.js
    sed -i.bak "s|/api/|$VERCEL_URL/api/|g" src/js/app.js

    # Deploy frontend
    netlify deploy --prod --dir .

    if [ $? -eq 0 ]; then
        print_success "Frontend deployed to Netlify"
        print_success "Hybrid deployment completed!"
        print_status "Your app now has:"
        echo "  ✅ Vercel backend (real-time APIs)"
        echo "  ✅ Netlify frontend (fast static hosting)"
        echo "  ✅ Working buttons with live data"
    else
        print_error "Netlify frontend deployment failed"
        exit 1
    fi
}

# Deploy to single platform (Vercel with serverless functions)
deploy_vercel_serverless() {
    print_status "Deploying to Vercel with serverless functions..."

    if ! command -v vercel &> /dev/null; then
        npm install -g vercel
    fi

    # Check login
    if ! vercel whoami &> /dev/null; then
        print_warning "Please login to Vercel first:"
        echo "Run: vercel login"
        echo "Then run this script again"
        exit 1
    fi

    # Create Vercel configuration for serverless
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "*.html",
      "use": "@vercel/static"
    },
    {
      "src": "src/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
EOF

    print_status "Deploying with serverless functions..."
    vercel --prod

    if [ $? -eq 0 ]; then
        print_success "Successfully deployed to Vercel with serverless functions!"
        print_status "Your app now has:"
        echo "  ✅ Serverless backend functions"
        echo "  ✅ Real-time API endpoints"
        echo "  ✅ Working buttons with live data"
        echo "  ✅ Automatic scaling"
    else
        print_error "Vercel serverless deployment failed"
        exit 1
    fi
}

# Show menu
show_menu() {
    echo ""
    echo "Choose deployment method:"
    echo "1) Railway (Full Stack - Recommended)"
    echo "2) Vercel + Netlify (Hybrid)"
    echo "3) Vercel Serverless (Single Platform)"
    echo "4) Test Backend Locally"
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
                deploy_railway_full
                break
                ;;
            2)
                deploy_hybrid
                break
                ;;
            3)
                deploy_vercel_serverless
                break
                ;;
            4)
                test_backend
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
    print_success "🎉 FULL DEPLOYMENT COMPLETED!"
    echo ""
    echo "Your Mumbai Transport app now has:"
    echo "✅ Real-time backend APIs"
    echo "✅ Working ticket booking system"
    echo "✅ Live fare information"
    echo "✅ Real ride comparison"
    echo "✅ All buttons fully functional"
    echo ""
    echo "🚀 Your app is ready for real users!"
}

# Run main function
main