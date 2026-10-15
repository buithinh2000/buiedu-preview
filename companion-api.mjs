// BuiEdu browser-side Companion API contract, no login secrets embedded or stored.
export class CompanionApi {
  constructor({baseUrl='',getAccessToken,fetchImpl=fetch,uuid=()=>crypto.randomUUID()}={}){
    if(typeof getAccessToken!=='function')throw new Error('auth_provider_required');
    this.baseUrl=baseUrl.replace(/\/$/,'');
    this.getAccessToken=getAccessToken;this.fetchImpl=fetchImpl;this.uuid=uuid;
  }
  // Create a turn object once. A network retry MUST reuse its requestId.
  createTurn({goalId,message,locale='vi'}){
    const requestId=this.uuid();
    const body={goalId,requestId,message,locale};
    return {requestId,send:()=>this.#send('/v1/companion/turn',body)};
  }
  resume({goalId,locale='vi'}){
    return this.#send('/v1/companion/resume',{goalId,locale});
  }
  async #send(path,body){
    const token=await this.getAccessToken();
    if(!token||typeof token!=='string')throw new Error('sign_in_required');
    let response;
    try{response=await this.fetchImpl(this.baseUrl+path,{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      cache:'no-store',body:JSON.stringify(body)
    })}catch(e){throw new Error('network_unavailable',{cause:e})}
    let payload;
    try{payload=await response.json()}catch{throw new Error('invalid_api_response')}
    if(!response.ok)throw new Error(payload?.error||'api_failed');
    if(!payload||!payload.data||typeof payload.data.reply!=='string')throw new Error('invalid_api_response');
    return payload.data;
  }
}
