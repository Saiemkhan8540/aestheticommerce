export const seo= ({title,description,keywords})=>{
    //set page title
    if(title){
        document.title=title;
    }
    //set description

    if(description){
       let metDesc= document.querySelector("meta[name='description']");
       if(metDesc){
          metDesc.setAttribute("content",description);
       }
    }

    //set meta keywords
    if(keywords){
        let key= document.querySelector("meta[name='keywords']");
        if(key){
            key.setAttribute("content",key);
        }
    }

}