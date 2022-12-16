var fs = require('fs');

exports.deleteImages = async function(files){
    var missingField = "";
    if(mode=='verification'){
    if(files.cnicFront){
        var path = files.cnicFront[0].path; 
        fs.unlinkSync(path);   
    }else missingField += missingField == "" ? "cnic front " : ", cnic front "; 
     if(files.cnicBack){
        var path = files.cnicBack[0].path;
        fs.unlinkSync(path);
        
     }else missingField += missingField == "" ? "cnic back image  " : ", cnic back image "; 
     if(files.licenseFront){
        var path = files.licenseFront[0].path; 
        fs.unlinkSync(path);
        
     }else missingField += missingField == "" ? "license front image " : ", license front image "; 
     if(files.licenseBack){
        var path = files.licenseBack[0].path; 
        fs.unlinkSync(path);
        
     }else missingField += missingField == "" ? "license back image " : ", license back image "; 
     if(files.utilityBill){
        var path = files.utilityBill[0].path; 
        fs.unlinkSync(path);
        
     }else missingField += missingField == "" ? "utility bill image " : ", utility bill image "; 
     if(files.image){
        var path = files.image[0].path;
        fs.unlinkSync(path);
        
     }else missingField +=  missingField == "" ? "user verification image " : ", user verification image ";  
     return missingField;
    }
    if(mode=='userProfile'){
        if(files.profilePicture){
            var path = files.profilePicture[0].path; 
            fs.unlinkSync(path);   
        }
    }
}

