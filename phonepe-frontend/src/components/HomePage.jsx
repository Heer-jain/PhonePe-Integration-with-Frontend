import { useState } from "react";
import axios from "../axios";
import "../styles/styles.css";

const HomePage = () => {
  const [userId, setUserId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const initiatePayment = async () => {
    try {
      const response = await axios.get("/pay", { userId, mobileNumber });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error initiating payment:", error);
    }
  };

  return (
    <div className="container">
      <h1>PhonePe Subscription Payment</h1>
      <input
        type="text"
        placeholder="Enter your User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter your Mobile Number"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
      />
      <button onClick={initiatePayment}>Pay Now</button>
    </div>
  );
};

export default HomePage;
