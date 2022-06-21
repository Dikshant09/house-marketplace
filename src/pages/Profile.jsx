import { useEffect, useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from 'react-toastify';

const Profile = () => {
  const auth = getAuth();
  const navigate = useNavigate();

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
    try{
      // Updating the name if it's really changed...
      if(auth.currentUser.displayName !== name){
        await updateProfile(auth.currentUser, {
          displayName: name
        })

        // Update in firestore : passing database, collection name, userID
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name: name
        })
        toast.success("Profile updated successfully"); 
      }
    }catch(error){
      console.log(error);
      toast.error("Couldn't update profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name] : value
    })) 
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
            type="text"
            name="name"
            className={!changeDetails ? "profileName" : "profileNameActive"}
            disabled={!changeDetails}
            value={name}
            onChange= {handleChange}
          />
          <input
            type="text"
            name="email"
            className= "profileEmail"
            disabled
            value={email}
            
            // className={!changeDetails ? "profileEmail" : "profileEmailActive"}
            // disabled={!changeDetails}
            // value={email}
            // onChange= {handleChange}
          />
        </div>
      </main>
    </div>
  );
};

export default Profile;
