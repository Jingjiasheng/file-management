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
const autoClearReqLimitCache = (clear_req_cycle_time: number) => {
    console.log("=============> Aleardy Init AutoClearReqLimitCache Cycle task!")
    setInterval(() => {
        console.log(`################################################################\n#Date time: ${new Date()}\n#Purpose:   Clear Req Limit Cache`)
        console.log("#Req_Auth: ",req_cache);
        req_cache.clear();
        console.log(`################################################################`);
    }, 1000 * clear_req_cycle_time)
};

export { autoClearReqLimitCache, reqLimitCheck }