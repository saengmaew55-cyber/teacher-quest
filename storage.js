const Store = {
  key:"teacherQuest_v1",
  get(){
    try{return JSON.parse(localStorage.getItem(this.key))||this.default();}
    catch(e){return this.default();}
  },
  set(p){localStorage.setItem(this.key,JSON.stringify(p));},
  default(){return {xp:0,attempts:0,correct:0,wrong:[],recent:[],combo:0,bestCombo:0,standardMastery:{S1:.5,S2:.5,S3:.5,S4:.5,S5:.5}};},
  reset(){localStorage.removeItem(this.key);location.reload();}
};