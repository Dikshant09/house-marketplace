import React from 'react'

const SuccessFulPayment = () => {
    const listing_id = window.location.href.split('/') ? window.location.href.split('/')[4] : null;
    if(!listing_id || window.location.href.split('/').length !== 6){
        return <h1>Bad Request 500</h1>;
    }

    const handleClick = (e) => {
        e.preventDefault();

        window.location = '/';
    }
  return (
    <>
        <h1 className='successFulPayment' style={{display: 'flex', justifyContent: 'center'}}>Thanks for purchase 🎉 of listing Id: {listing_id}</h1>
        <button className='primaryButton' style={{width: '15%'}} onClick={handleClick}>
            Click to go back
        </button>
    </>
  )
}

export default SuccessFulPayment;