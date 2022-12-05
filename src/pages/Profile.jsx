import { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/homeIcon.svg";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

const Profile = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, "listings");

      const q = query(
        listingsRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );

      const querySnap = await getDocs(q);

      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(listings);
      setLoading(false);
    };

    fetchUserListings();
  }, [auth.currentUser.uid]);

  const [changeDetails, setChangeDetails] = useState(false);

  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const { name, email } = formData;

  const handleLogOut = (e) => {
    e.preventDefault();

    auth.signOut();

    navigate("/");
  };

  const onSubmit = async (e) => {
    try {
      // Updating the name if it's really changed...
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // Update in firestore : passing database, collection name, userID
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name: name,
        });
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Couldn't update profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDelete = async (listingId) => {
    if(window.confirm('Are you sure you want to delete this listing?')) {
      const docRef = doc(db, 'listings', listingId);

      await deleteDoc(docRef);
      
      const updateListings = listings.filter((listing) => listing.id !== listingId);
      setListings(updateListings);
      toast.success('Sucessfully deleted listing');
    }else{
      toast.error("Couldn't delete listing");
    }
  }

  const handleEdit = async (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={handleLogOut}>
          Log Out
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? "done" : "change"}
          </p>
        </div>

        <div className="profileCard">
          <input
            type="email"
            name="name"
            className={!changeDetails ? "profileName" : "profileNameActive"}
            disabled={!changeDetails}
            value={name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="email"
            className="profileEmail"
            disabled
            value={email}

            // className={!changeDetails ? "profileEmail" : "profileEmailActive"}
            // disabled={!changeDetails}
            // value={email}
            // onChange= {handleChange}
          />
        </div>
        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="" />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <div className="listingText">Your Text</div>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  onDelete={() => handleDelete(listing.id)}
                  onEdit= {() => handleEdit(listing.id)}
                  listing={listing.data}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
