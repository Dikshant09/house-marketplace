import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase.config";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const EditListing = () => {
  // eslint-disable-next-line
  const [geoLocationEnabled, setGeoLocationEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(null);

  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const params = useParams();

  // Redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error("You can not edit that listing");
      navigate("/");
    }
  }, [auth.currentUser.uid, listing, navigate]);

  // Fetch listing to edit...
  useEffect(() => {
    setLoading(true);

    const fetchListing = async () => {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data(), address: docSnap.data().location });
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Listing doesn't exist");
      }
    };
    fetchListing();
  }, [params.listingId, navigate]);

  // Sets userRef to logged in user
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate("/sign-in");
        }
      });
    }
    return () => {
      isMounted.current = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (offer && discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error("Discounted price needs to be less than regular price");
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error("Max 6 images");
      return;
    }

    // Seting Geolocation : )
    let geolocation = {};
    let location;

    if (geoLocationEnabled) {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${process.env.REACT_APP_GEOCODE_API_KEY}`
      );

      const data = await response.json();

      geolocation.lat = data.features[0]?.center[1] ?? 0;
      geolocation.lng = data.features[0]?.center[0] ?? 0;

      location = data.features.length === 0 ? undefined : address;

      if (location === undefined || location.includes("undefined")) {
        setLoading(false);
        toast.error("Please enter a correct location");
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    location = address;

    // Store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();

        const metadata = {
          contentType: "image/jpeg",
        };

        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, "images/" + fileName);

        const uploadTask = uploadBytesResumable(storageRef, image, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // eslint-disable-next-line
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          (error) => {
            reject(error);
          },
          () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imageUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Images not uploaded!");
    });

    const formDataCopy = {
      ...formData,
      imageUrls,
      timestamp: serverTimestamp(),
      geolocation,
    };

    delete formDataCopy.images;
    delete formDataCopy.address;

    formDataCopy.location = address;

    // If offer exist, then only we keep discountedPrice...
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    // Updating listing...
    const docRef = doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success("Listing saved successfully");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const handleChange = (e) => {
    let boolean = null;

    if (e.target.value === "true") {
      boolean = true;
    }

    if (e.target.value === "false") {
      boolean = false;
    }

    // If image file : then setting images
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // Text/Boolean/Number
    if (!e.target.files) {
      const { name, value } = e.target;

      setFormData((prevState) => ({
        ...prevState,
        [name]: boolean ?? value,
      }));
    }
  };

  if (loading) return <Spinner />;
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit Listing</p>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === "sale" ? "formButtonActive" : "formButton"}
              name="type"
              value="sale"
              onClick={handleChange}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === "rent" ? "formButtonActive" : "formButton"}
              name="type"
              value="rent"
              onClick={handleChange}
            >
              Rent
            </button>
          </div>

          <label className="formLabel">Name</label>
          <input
            type="text"
            className="formInputName"
            name="name"
            value={name}
            onChange={handleChange}
            maxLength="32"
            minLength="10"
            required
          />
          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                name="bedrooms"
                value={bedrooms}
                onChange={handleChange}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                name="bathrooms"
                value={bathrooms}
                onChange={handleChange}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label className="formLabel">Parking Spot</label>
          <div className="formButtons">
            <button
              className={parking ? "formButtonActive" : "formButton"}
              type="button"
              name="parking"
              value={true}
              onClick={handleChange}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              name="parking"
              value={false}
              onClick={handleChange}
            >
              No
            </button>
          </div>

          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? "formButtonActive" : "formButton"}
              type="button"
              name="furnished"
              value={true}
              onClick={handleChange}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              name="furnished"
              value={false}
              onClick={handleChange}
            >
              No
            </button>
          </div>

          <label className="formLabel">Address</label>
          <textarea
            name="address"
            className="formInputAddress"
            type="text"
            value={address}
            onChange={handleChange}
            required
          />

          {!geoLocationEnabled && (
            //   <div className="formLatting flex">
            <div className="formLabel flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  name="latitude"
                  value={latitude}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  name="longitude"
                  value={longitude}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? "formButtonActive" : "formButton"}
              type="button"
              name="offer"
              value={true}
              onClick={handleChange}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              name="offer"
              value={false}
              onClick={handleChange}
            >
              No
            </button>
          </div>

          <label className="formLabel">Regular Price</label>
          <div className="formButtons">
            <input
              className="formInputSmall"
              type="number"
              name="regularPrice"
              value={regularPrice}
              onChange={handleChange}
              min="50"
              max="750000000"
            />
            {type === "rent" && <p className="formPriceText">$ /- Month</p>}
          </div>
          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                className="formInputSmall"
                type="number"
                name="discountedPrice"
                value={discountedPrice}
                onChange={handleChange}
                min="50"
                max="750000000"
              />
            </>
          )}

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            name="images"
            onChange={handleChange}
            max="6"
            accept=".jpg, .jpeg, .png"
            multiple
            required
          />
          <button className="primaryButton createListngButton" type="submit">
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditListing;
