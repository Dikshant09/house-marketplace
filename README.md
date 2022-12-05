# House Marketplace
- It’s a real estate E-commerce website to buy and sell houses. 
- Here one can add, edit, delete and post a listing in real-time. 
- React is used as Frontend and Firebase as Backend. 
- Using Google Geocoding API to get Coordinates for map plotting
- Stripe API is used to handle payments. 

<b>Backend : </b>
- [Backend Repo](https://github.com/Dikshant09/house-marketplace-backend-stripe-payments) 
- [Live Link](https://kind-pink-cockroach-veil.cyclic.app/)

## Requirements

- Node v10+
- Configured .env file
- Google Account

## How to run

1. Confirm `.env` configuration

Ensure the API keys are configured in `.env` in this directory. It should include the following keys:

```yaml
# Google Geocoding API keys - see https://developers.google.com/maps/documentation/geocoding/start
REACT_APP_GEOCODE_API_KEY = pk.asfe...

# Path of backend-end implementation. 
REACT_APP_BACKEND_URL = "https://backend_app_url.com"

```

2. Install dependencies and start the server

```
npm install
npm start
```
