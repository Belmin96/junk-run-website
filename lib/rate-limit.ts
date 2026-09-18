type Entry={count:number;resetAt:number};
const buckets=new Map<string,Entry>();
export function rateLimit(key:string,limit=60,windowMs=60000){
 const now=Date.now(),current=buckets.get(key);
 if(!current||current.resetAt<=now){buckets.set(key,{count:1,resetAt:now+windowMs});return {ok:true,remaining:limit-1};}
 current.count++;
 return {ok:current.count<=limit,remaining:Math.max(0,limit-current.count),retryAfterSeconds:Math.ceil((current.resetAt-now)/1000)};
}