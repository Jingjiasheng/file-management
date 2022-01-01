
const req_cache: Map<string, number> = new Map();

const reqLimitCheck = (ip: string): boolean => {
    const last_req_time =  req_cache.get(ip)
    // if (last_req_time !== undefined && (Date.now() - last_req_time) < 3 * 1000) {
    //     return false;
    // }
    req_cache.set(ip, Date.now());
    return true;
}

// auto clear req_info every 1 minute
const interval = setInterval(() => {
    console.log(`${Date()} Start Clear ===> `, req_cache);
    req_cache.clear();
    console.log(`${Date()} Clear Finish ===> `, req_cache);
}, 1000 * 30)

export { reqLimitCheck, interval };

