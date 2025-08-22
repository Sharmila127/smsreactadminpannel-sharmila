/* eslint-disable @typescript-eslint/no-explicit-any */
import Client from "../../../api";

export const getOrdersHistory = async(params: string)=>{
    try{
        const response = await new Client().admin.order_history.getAll(params)
        console.log(response);
        return response
    }catch(error){
        console.log("Error getting orders history:", error)
    }
}

export const getAllOrdersHistory = async(params: string)=>{
    try{
        const response = await new Client().admin.order_history.getOldHistory(params)
        console.log(response);
        return response
    }catch(error){
        console.log("Error getting orders history:", error)
    }
}


// export const statusOrderHistory=async(params:string,data:any)=>{
//     try{
//         const response=await new Client().admin.order_history.updateStatus(params,data)
//         console.log(response);
//         return response
//     }catch(error){
//       console.log("error getting status",error)
//     }
// }


export const statusOrderHistory = async (id: string, data: any) => {
  try {
    const response = await new Client().admin.order_history.updateStatus(id, data);
    console.log(response);
    return response;
  } catch (error) {
    console.log("error getting status", error);
  }
};


export const getBillingStatus = async (params:any)=>{
  try{
const response = await new Client().admin.jobcard.getbilling(params);
console.log(response)
return response;

  }
  catch(error){
    console.log("error fetching for billing",error)
  }
}