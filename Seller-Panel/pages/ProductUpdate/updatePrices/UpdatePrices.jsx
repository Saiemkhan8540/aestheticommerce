import React,{useEffect,useState} from "react";
import axios from "axios";
import {useNavigate,useParams} from "react-router-dom";
import BackButton from "../../../src/components/Common/BackButton/BackButton";
import "./updatePrices.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function UpdatePrices(){
  const {id} = useParams();
  const navigate = useNavigate();

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState(false);
  const [formData,setFormData] = useState({
    sellingPrice:"",
    discount:"",
    platformFee:0,
    logisticsFee:60,
    transactionFee:10,
    calculatedPrice:0,
    discountAmount:0,
    mrp:0
  });

  useEffect(()=>{
    const fetchProduct = async()=>{
      const token = localStorage.getItem("sellerToken");
      const res = await axios.get(`${API_URL}/api/productinfo/${id}`,{
        headers:{ Authorization:`Bearer ${token}` }
      });
      const p = res.data;

      setFormData({
        sellingPrice:p.sellingPrice||"",
        discount:p.discountPercentage||"",
        platformFee:p.platformFee||0,
        logisticsFee:p.logisticsFee||60,
        transactionFee:p.transactionFee||10,
        calculatedPrice:p.calculatedPrice||0,
        discountAmount:0,
        mrp:p.mrp||0
      });
    };
    fetchProduct();
  },[id]);

  const handleChange=(e)=>{
    const {name,value}=e.target;

    setFormData(prev=>{
      let updated={...prev,[name]:value};

      const sellingPrice=parseFloat(name==="sellingPrice"?value:updated.sellingPrice)||0;
      const discount=parseFloat(name==="discount"?value:updated.discount)||0;

      const platformFee=Math.round(sellingPrice*0.15);
      const logisticsFee=60;
      const transactionFee=10;

      const calculatedPrice=sellingPrice+platformFee+logisticsFee+transactionFee;
      const discountAmount=calculatedPrice*(discount/100);
      const mrp=calculatedPrice+discountAmount;

      updated.platformFee=platformFee;
      updated.logisticsFee=logisticsFee;
      updated.transactionFee=transactionFee;
      updated.calculatedPrice=Math.round(calculatedPrice);
      updated.discountAmount=Math.round(discountAmount);
      updated.mrp=Math.round(mrp);

      return updated;
    });
  };

  const validate = () => {
  const price = String(formData.sellingPrice).trim();
  const discount = String(formData.discount).trim();

  // selling price
  if (price === "") {
    return "Selling price is required";
  }

  if (isNaN(price)) {
    return "Selling price must be a number";
  }

  if (Number(price) <= 0) {
    return "Selling price must be greater than 0";
  }

  // discount
  if (discount !== "" && isNaN(discount)) {
    return "Discount must be a number";
  }

  if (discount !== "" && (Number(discount) < 0 || Number(discount) > 90)) {
    return "Discount must be between 0–90%";
  }

  return null;
};


  const handleSubmit=async()=>{
    setSuccess(false);
    const validationError=validate();
    if(validationError){
      setError(validationError);
      return;
    }

    try{
      setLoading(true);
      setError("");
      const token=localStorage.getItem("sellerToken");
      await axios.patch(`${API_URL}/api/productinfo/${id}/pricing`,{
        sellingPrice:Number(formData.sellingPrice),
        discountPercentage:Number(formData.discount),
        platformFee:Number(formData.platformFee),
        logisticsFee:Number(formData.logisticsFee),
        transactionFee:Number(formData.transactionFee),
        mrp:Number(formData.mrp)
      },{
        headers:{Authorization:`Bearer ${token}`}
      });

      setSuccess(true);
    }catch(err){
      setError(err?.response?.data?.message || "Pricing update failed");
    }finally{
      setLoading(false);
    }
  };

  return(
    <div className="page-container">
      <div className="add-product">
        <BackButton to="/my-products" />
        <h2>Update Product Pricing</h2>

        <div className="product-form">
          <div className="form-row">
            <div className="form-col">
              <label>Selling Price *</label>
              <input name="sellingPrice" type="number" min="1" required value={formData.sellingPrice} onChange={handleChange} />
            </div>

            <div className="form-col">
              <label>Discount %</label>
              <input name="discount" type="number" min="0" max="90" value={formData.discount} onChange={handleChange}/>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col"><label>Platform Fee</label><input value={formData.platformFee} readOnly/></div>
            <div className="form-col"><label>Logistics Fee</label><input value={formData.logisticsFee} readOnly/></div>
            <div className="form-col"><label>Transaction Fee</label><input value={formData.transactionFee} readOnly/></div>
          </div>

          <div className="form-row">
            <div className="form-col"><label>Calculated Price</label><input value={formData.calculatedPrice} readOnly/></div>
            <div className="form-col"><label>Discount Amount</label><input value={formData.discountAmount} readOnly/></div>
            <div className="form-col"><label>MRP *</label><input value={formData.mrp} readOnly/></div>
          </div>
        </div>

        {error && <p className="error-text">❌ {error}</p>}
        
        {success && (
          <div className="success-box">
            <p>Product updated successfully</p>
            <button
              className="continue-btn"
              onClick={() => navigate(`/my-products`)}
            >
              Continue
            </button>
          </div>
        )}

        {!success && (<div className="action-buttons">
          <button className="skip-btn" onClick={()=>navigate(`/my-products`)}>Skip</button>
          <button className="cancel-btn" onClick={()=>navigate("/my-products")}>Cancel</button>
          <button className="save-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save & Update"}
          </button>
        </div>)}
      </div>
    </div>
  );
}
