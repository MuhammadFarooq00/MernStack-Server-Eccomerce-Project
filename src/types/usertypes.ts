import { NextFunction, Request, Response } from "express";


export interface NewuserRequestBody {
    _id: string;
    name: string;
    photo: string;
    email: string;
    gender: string;
    dob: Date;
}

export interface NewProductRequestBody {
  name: string;
  price: number;
  stock: number;
  category: string;
}

export type Controllertypes = (
  req: Request,
  res: Response<any>,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export interface SearchQueryRequest {
  price?: string;
  sort?: string;
  category?: string;
  search?: string;
  page?: string;
}

export interface Basequery {
  name?: {
    $regex: string,
    $options: string,
  },
  price?: {$lte: number;};
  category?: string | undefined;
}

export interface InvalidateCacheProps {
    product?: boolean,
    order?: boolean,
    admin?: boolean,
    userID?: string,
    orderID?: string
}

export type Orderitemstypes = {
     name: string,
     photo: string,
     price: number,
     quantity: number,
     productId: string
}

export type shippinginfotypes = {
  address: string,
  city: string,
  state: string,
  counrty: string,
  pincode: number
}

export interface NewOrderRequestBody {
  shippingInfo: shippinginfotypes;
  user: string;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  shippingCharges?: number;
  orderItems: Orderitemstypes[]
}