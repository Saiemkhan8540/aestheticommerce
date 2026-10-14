import React from "react";
import "./about.css"
import image from "../../Images/founder.jpg"
import image1 from "../../Images/IMG_5.png"
import image5 from "../../Images/values.jpg"
import image6 from "../../Images/our_mission.jpg"

function AboutSection(){
    return(
    <div className="about_container">
      
    <div className="box">
        <div className="image_text">
       <div className="image_box" style={{
        backgroundImage:`url(${image})`
        }}>  
         </div> 
         <div className="text">
           <h1>Nazre Alam</h1>
            <h1>Founder & Director, Aestheticommerce</h1>
            </div>
        </div>
         <div className="right_side">
            <div className="founder_header">
                  <h2 className="founder_note">Founder's Note</h2>
      <p className="founder_tagline">"Creator-First Marketplace for Handmade & Aesthetic Goods"</p>
            </div>
        <div className="content_box">
            <p>Most creators and early-stage businesses don’t fail due to lack of talent, they fail due to lack of the right system. Aestheticommerce is built to bridge creativity with technology and replace outdated, complex e-commerce processes with smarter, scalable systems. With 3+ years of experience in startup consulting and a background in theatre production design, I’ve seen both the creative challenges at ground level and the operational gaps in execution. Aestheticommerce brings this together into one ecosystem where creators, sellers, and brands can build, manage, and scale efficiently through better structure, technology, and streamlined processes. We’re just getting started. If you believe in building smarter and growing faster, let’s build something that actually works.</p>
        </div>
       </div>
     </div> 
     {/* Section 2 ---------About section   */}
     <div className="company_info">
          <div className="heading_box">
            <span className="handwrite">About</span>
            <h1 className="main_heading">Aestheticommerce Pvt. Ltd.</h1>
        </div>
        <div className="info_box">
        <div className="content_box2">
            <p>Aestheticommerce Pvt. Ltd. is an India-based
              online platform that champions the talents of
              artists - Women, Men, student creators, and
              makers from every background. As an internet
              marketplace, we empower independent artists
              and students to share their handcrafted
              creations with a worldwide audience. Every
              item is handmade and unique, turning simple
              transactions into stories that bridge cultures
              and inspire creativity.</p>
        </div>
        <div className="content_image" style={{backgroundImage:`url(${image1})`}}></div>
     </div>
     </div>
  {/* Section 3 ------Our Values */}

  <div className="box">
        <div className="image_text">
       <div className="content_image" style={{
        backgroundImage:`url(${image5})`
        }}>  
         </div> 
        </div>
         <div className="right_side">
            <div className="founder_header">
                  <h2 className="founder_note">Core Values</h2>
            </div>
        <div className="content_box2">
             <ul>
            <li>
                <span className="list_heading">Creativity : </span>
               Every piece reflects the spirit and imagination of its maker.
            </li>
            <li>
                <span className="list_heading">Integrity : </span>
                Transparent, ethical dealings for both creators and customers.
            </li>
            <li>
                <span className="list_heading">Collaboration : </span>
                Building partnerships and a supportive creative ecosystem.
            </li>
            <li>
                <span className="list_heading">Empowerment : </span>
           Helping artists and creators thrive and be recognized for their craft.
            </li>
           </ul>

        </div>
       </div>
     </div>



     {/* section 4 ------ Our Mission */}
       <div className="company_info">
          <div className="heading_box">
            <span className="handwrite1">Our Mission</span>
         
        </div>
        <div className="info_box">
        <div className="content_box2">
           <ul>
            <li>
                <span className="list_heading">Empowerment : </span>
                Giving a voice and opportunity to individual artists, students, and creators.
            </li>
            <li>
                <span className="list_heading">Elegance & Authenticity : </span>
                Curating only the finest, genuine handmade creations.
            </li>
            <li>
                <span className="list_heading">Cross-Border Connections : </span>
                Breaking geographical boundaries to connect creators and buyers around the world.
            </li>
            <li>
                <span className="list_heading">Sustainable Creativity : </span>
                Fostering conscious consumerism and celebrating the value of human touch.
            </li>
           </ul>
        </div>
        <div className="content_image" style={{backgroundImage:`url(${image6})`}}></div>
     </div>
     </div>


     {/* Team section */}
     <div className="team_section">
       <span className="handwrite1">Meet Our Team</span>
     <div className="team_info">
        <div className="team_member">
         <div className="team team_placeholder"></div>
        <div className="member_name"><h2>Naqueeb Alam</h2><h4>Chief Technology Officer (CTO)</h4></div>
        </div>
         <div className="team_member">
              <div className="team team_placeholder"></div>
         <div className="member_name"><h2>Naiyar Alam</h2><h4>Chief Marketing Officer (CMO)</h4></div>
        </div>
         <div className="team_member">
        <div className="team team_placeholder"></div>
        <div className="member_name"><h2>Nujhat Parveen</h2><h4>Chief Human Resources Officer (CHRO)</h4></div>
        </div>
        <div className="team_member">
        <div className="team team_placeholder"></div>
        <div className="member_name"><h2>Mudassir</h2><h4>Chief Operating Officer (COO)</h4></div>
        </div>
     </div>
     </div>
       
    </div>
    );
}
export default AboutSection;