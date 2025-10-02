export const logger = (req, res, next)=>{
    console.log(`${new Date().toLocaleString()} ${req.method} ${req.url} ${req.ip}`);
    next();
}