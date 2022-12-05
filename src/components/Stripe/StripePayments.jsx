import React from 'react'

const StripePayments = ({ listing, listing_id, userName }) => {
    const money = (listing.offer ? listing.discountedPrice : listing.regularPrice);
    const checkOut = () => {
        fetch("http://localhost:3500/create-checkout-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: [
                { id: listing_id, quantity: 1, name: userName, amount: money * 100, building: `${listing.name}, ${listing.bedrooms} Bedrooms, ${listing.bathrooms} Bathrooms, ${listing.parking ? 'With Parking' : ''} in ${listing.location}` },
              ],
            }),
          })
            .then(res => {
              if (res.ok) return res.json()
              return res.json().then(json => Promise.reject(json))
            })
            .then(({ url }) => {
              window.location = url
            })
            .catch(e => {
              console.error(e.error)
            })
            
    }
  return (
    <button className='primaryButton' onClick={checkOut}>CheckOut:  ${money.toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} </button>
  )
}

export default StripePayments;