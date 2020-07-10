import {AbstractUser} from "..";
import {Request} from "express";

export interface SecureRequest extends Request {
    payload: AbstractUser;
}
