
export function filterAndSearch(keyword:any, originalString:any){
    if(keyword && typeof keyword != 'string'){
        keyword = keyword.toString()
    }
    if(originalString && typeof originalString != 'string'){
        originalString = originalString.toString()
    }

    if((keyword != null && keyword != '') && originalString == undefined) return false;

    if(keyword && (originalString.startsWith(keyword.toString()) || originalString.includes(keyword))){
        return true
      }
      if(keyword == undefined || keyword == ""){
        return true
      }
      return false
}