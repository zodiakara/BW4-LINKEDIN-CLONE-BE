import express from "express";
import createHttpError from "http-errors";
import experiencesModel from "./model.js";
import q2m from "query-to-mongo";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const experiencesRouter = express.Router();

experiencesRouter.post("/", async (req,res,next)=>{
    try{
        const newExperiences = new experiencesModel(req.body);
        const{_id}= await newExperiences.save();

        res.status(201).send({message:`Added a new experiences.`,_id});
        
    }catch(error){
        next(error);
    }
})

experiencesRouter.get("/", async (req,res,next)=>{
    try{
        const mongoQuery = q2m(req.query);
        console.log(req.query, mongoQuery)
        const total = await experiencesModel.countDocuments(mongoQuery.criteria);
        const experiences = await experiencesModel.find(
          mongoQuery.criteria,
          mongoQuery.options.fields
        )
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)
        res.status(200).send({
          links:mongoQuery.links(localEndpoint,total),
          total,
          totalPages: Math.ceil(total/mongoQuery.options.limit), 
          experiences
        })        
    }catch(error){ 
        next(error)
    }    
})

experiencesRouter.get("/users/:userId/experiences", async (req,res,next)=>{
    try{
        const mongoQuery = q2m(req.query);
        console.log(req.query, mongoQuery)
        const total = await experiencesModel.countDocuments(mongoQuery.criteria);
        const experiences = await experiencesModel.find(
          mongoQuery.criteria,
          mongoQuery.options.fields
        )
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)
        res.status(200).send({
          links:mongoQuery.links(localEndpoint,total),
          total,
          totalPages: Math.ceil(total/mongoQuery.options.limit), 
          experiences
        })        
    }catch(error){ 
        next(error)
    }    
})

experiencesRouter.get("/:userId", async (req,res,next)=>{
    try{
        const mongoQuery = q2m.apply(req.query);
        const total = await experiencesModel.countDocuments(mongoQuery.criteria);
        const experiences = await experiencesModel.find(
          mongoQuery.criteria,
          mongoQuery.options.fields
        )
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)
        res.status(200).send({
          links:mongoQuery.links(localEndpoint,total),
          total,
          totalPages: Math.ceil(total/mongoQuery.options.limit), 
          experiences
        })        
    }catch(error){ 
        next(error)
    }    
})
 
experiencesRouter.get("/users/:userId/experiences/:experiencesId" , async (req,res,next)=>{
    try{     
        const foundexperiences = await experiencesModel.findById(req.params.experiencesId)       
        if(foundexperiences){
            res.status(200).send(foundexperiences);
        }else{next(createHttpError(404, "experiences Not Found"));
    } 
    }catch(error){
        next(error);
    }
})

experiencesRouter.post("/users/:userId/experiences", async (req,res,next)=>{
    try{
        const newExperiences = new experiencesModel(req.body);
        const{_id}= await newExperiences.save();

        res.status(201).send({message:`Added a new experiences.`,_id});
        
    }catch(error){
        next(error);
    }
})

experiencesRouter.put("/users/:userId/experiences/:experiencesId", async (req,res,next)=>{
    try{ const foundexperiences = await experiencesModel.findByIdAndUpdate(req.params.experiencesId,
      {...req.body},
      {new:true,runValidators:true});
        console.log(req.headers.origin, "PUT experiences at:", new Date());
        
        res.status(200).send(updatedexperiences);
        
    }catch(error){ 
        next(error);
    }
})


experiencesRouter.delete("/users/:userId/experiences/:experiencesId", async (req,res,next)=>{try{
     const deletedexperiences =  await experiencesModel.findByIdAndDelete(req.params.experiencesId)      
    if(deletedexperiences){
      res.status(204).send({message:"experiences has been deleted."})
    }else{
      next(createHttpError(404, "experiences Not Found"));    
    }
}catch(error){
    next(error)
}
})

export default experiencesRouter;