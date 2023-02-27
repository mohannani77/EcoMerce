const jwt=require('jsonwebtoken')

const auth=(req,res,next)=>{
    const token=req.header("x-auth");
    if(!token){
        return res.status(401).send("Access denied....... not Authenticated...")
    }
    try {
        const secretKey = process.env.JWT_SECRET_KEY;
        const user=jwt.verify(token,secretKey)
      
        req.user=user
  
        next()
    } catch (error) {
        return res.status(400).send("Access denied.. Invalid Token...")
    }

}


const isUser =(req,res,next)=>{
    auth(req,res, ()=>{
        if(req.user.user._id === req.params.id || req.user.user.isAdmin){
            next()
        }else{
            res.status(403).send("Access denied .Not Authorized...")
        }
    })
}



const isAdmin=(req,res,next)=>{
    auth(req,res,()=>{
        if(req.user.user.isAdmin){
            next()
        }
        else{
            return res.status(403).send("Access denied..Not Authorized...")
        }
    })
}
module.exports={isAdmin,auth,isUser}