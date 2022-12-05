import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";
import { toast } from "react-toastify";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import StripePayments from "../components/Stripe/StripePayments";

const Listing = () => {
  const [purchase, setPurchase] = useState(false);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, "listings", params.listingId);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists) {
        setListing(docSnap.data());
        setLoading(false);
      } else {
        toast.error("Couldn't load the listing...");
      }
    };
    fetchListing();
  }, [navigate, params.listingId]);

  if (loading) {
    return <Spinner />;
  }

  const listing_id = window.location.href.split('/').pop();

  const handlePurchaseClick = (e) => {
    e.preventDefault();

    setPurchase((prevState) =>  !prevState);
    toast.success('Tip Use : 4242.... for testing payments');
  }

  return (
    <main>
      <Swiper
        slidesPerView={1}
        pagination={{ clickable: true }}
        className="swiper-container"
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        navigation
        scrollbar={{ draggable: true }}
      >
        {listing.imageUrls.map((image, index) => (
          <SwiperSlide key={index} virtualIndex={index}>
            <div
              style={{
                background: `url(${listing.imageUrls[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="swiperSlideDiv"
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt="shareIcon" />
      </div>

      {shareLinkCopied && <p className="linkCopied">Link Copied</p>}

      <div className="listingDetails">
        <p className="listingName">
          {listing.name} -{"  $"}
          {listing.offer
            ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">
          For {listing.type[0].toUpperCase() + listing.type.slice(1)}
        </p>
        {listing.offer && (
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}

        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : `${listing.bedrooms} Bedroom`}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : `${listing.bathrooms} Bathroom`}
          </li>
          <li>{listing.parking && "Parking Spot"}</li>
          <li>{listing.furnished && "furnished"}</li>
        </ul>
        <p className="listingLocationTitle">Location</p>

        <div className="leafletContainer">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className="primaryButton"
            style={{marginBottom: '20px', width: '35%'}}
            >
            Contact LandLord
          </Link>
          { !purchase ?           
            <button
            className="primaryButton"
            onClick = {handlePurchaseClick}
            style={{marginBottom: '20px', width: '35%'}}
              >
              Purchase Now
            </button> 
            : 
            (<h2 className="primaryButton" style={{marginBottom: '20px', width: '35%'}}>
              <StripePayments listing={listing} listing_id ={listing_id} userName={auth.currentUser.displayName}/>
            </h2>)
          }
          </div>
        )}
      </div>
    </main>
  );
};

export default Listing;
