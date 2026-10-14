import React, { useState } from "react";
import "./Contactus.css";
import { MdEmail } from "react-icons/md";
import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";
import axios from "axios"
const ContactUs = () => {
  const[formData,setFormData]=useState({name:"",email:"",message:""});
  const[loading,setLoading]=useState(false);
  const[responseMsg,setResponseMsg]=useState("");
  //handle input changes
  const handleChange=(e)=>{
    setFormData({
      ...formData,
      [e.target.name] :e.target.value
    }
    );
  };

  //handle form submission
  const handleSubmit=async(e)=>{
    e.preventDefault();
    setLoading(true);
    setResponseMsg("");
    try{
     const res= await axios.post("http://localhost:5000/api/contact-us",formData);
     setResponseMsg(res.data.message);
     setFormData({name:"",email:"",message:""});
     setTimeout(()=>{
      setResponseMsg("")
     },3000);

    }catch(error){
      setResponseMsg(error.response?.data?.message||"Something went wrong!");
      setTimeout(()=>{
        setResponseMsg("")
      },3000);
    }finally {
      setLoading(false);
    }
  };
  return(
    
  <div className="contact-main">
    <div className="contact-sidebar">
      <a href="mailto:consulting@businesscurative.com" target="_blank" rel="noopener noreferrer" className="icon-link">
        <MdEmail />
        <span className="tooltip-text">Mail to us</span>
      </a>
      <a href="https://wa.me/00000009009" target="_blank" rel="noopener noreferrer" className="icon-link">
        <FaWhatsapp />
        <span className="tooltip-text">Chat with us</span>
      </a>
      <a href="https://www.instagram.com/aestheticommerce/" target="_blank" rel="noopener noreferrer" className="icon-link">
        <FaInstagram />
        <span className="tooltip-text">Our Public Profile</span>
      </a>
      <a href="https://www.linkedin.com/company/aestheticommerce" target="_blank" rel="noopener noreferrer" className="icon-link">
        <FaLinkedin />
        <span className="tooltip-text">Our Official Profile</span>
      </a>
    </div>
    <div className="contact-container">
      <form className="contact-form" onSubmit={handleSubmit}>
        <h2>Contact Us</h2>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter your name"
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows="5"
          required
          value={formData.message}
          onChange={handleChange}
          placeholder="Type your message here"
        />

        {/* <button type="submit">Send Message</button> */}
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>

        {responseMsg && <p className="response-message">{responseMsg}</p>}
      </form>

    </div>
  </div>
    
  );

  
}

export default ContactUs;