export function getObjectDepth(value : object) : any {
    for (const [key, maps] of Object.fromEntries(value)) {
        return 1 + Math.max(0, ...value.map(getObjectDepth)) :
        0;
    }    
  }