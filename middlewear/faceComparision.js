//const {spawn} = require('child_process');

const asyncHandler = require('./async');



const compare = asyncHandler( async (req, res, next) => {
  
    async function spawnChild() {
        child = require('child_process').execFile(__dirname + '\\compareFace\\compareFace.exe', [
            req.body.cnicFront, req.body.image
        ], {

            detached: true,
            stdio: ['ignore', 1, 2]
        });
       
        let data = "";
        for await (const chunk of child.stdout) {
            data += chunk;
        }
        let error = "";
        for await (const chunk of child.stderr) {
            error += chunk;
        }
        const exitCode = await new Promise((resolve, reject) => {
            child.on('close', resolve);
        });

        if (exitCode) {
            throw new Error(`subprocess error exit ${exitCode}, ${error}`);
        }
        return data;
    }
    spawnChild()

        .then(

            data => {
                console.log("data> "+data)
                if (data.includes("True")) {
                    console.log("True");
                    res.facesMatched = true;
                    next();
                }
                if (!data.includes("True")) {
                    return res.status(400).json({ Success: false, Message: 'Faces Did not Match..', responseCode : 400})
                }
                

            },
            err => {
                console.log("err > > +"+err)
                return res.status(400).json({ Success: false, Message: 'Faces Did not Match..', responseCode : 400 })
            }
        );
}
)


module.exports = compare;
