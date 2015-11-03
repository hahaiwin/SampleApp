var unique = function(arr){
  var newArr=[], obj = {}, i;
    for(i=0;i<arr.length;i++){
        if(!obj.hasOwnProperty(arr[i])){
            newArr.push(arr[i]);
            obj[arr[i]] = i;
        }
    }

    return newArr;
};

console.log(unique([1, 1, 2, 3]));
