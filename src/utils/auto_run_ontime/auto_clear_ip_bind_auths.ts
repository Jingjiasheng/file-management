/**
 * @description Everyone IP can create three auths on one day
 */

const auth_bind_req: Map<string, Array<string>> = new Map();

/**
 * Checks every req if have new auth in same IP and set it
 * @param ip request remote client ip
 * @param auth remote client set auth
 */ 
const checkSetAuth = (ip: string, auth: string): boolean => {
    // first check if have auth in IP
    let auth_list: Array<string> | undefined = auth_bind_req.get(ip);
    let result: boolean = true;
    // if don't have, then created it and init first auth in it 
    if (!auth_list || auth_list.length === 0){
        auth_list = [auth];
        auth_bind_req.set(ip, auth_list)
        result = true;
    } else{
        if (auth_list.length >= 3 && !auth_list.includes(auth)){
            result = false;
            // throw new Error("You set your auth too quickly, Please set again tomorrow!")
        }
        if (!auth_list.includes(auth) && auth_list.length < 3){
            auth_list.push(auth);
            auth_bind_req.set(ip, auth_list)
            result = true;
        }
    }
    return result;
}

/**
 * Auto clear IP's auth info 
 *  @param cycle_length times unit : sec
 */ 
const clearIpBindAuth = (cycle_length: number): void => {
    console.log("=============> Aleardy Init ClearIpBindAuth Cycle task!")
    setInterval(()=>{
        console.log(`################################################################\n#Date time: ${new Date()}\n#Purpose:   Clear Req_Auth `)
        console.log("#Req_Auth: ",auth_bind_req);
        auth_bind_req.clear();
        console.log(`################################################################`);
    }, cycle_length * 1000)// unit :milliseconds
}

export { clearIpBindAuth, checkSetAuth }