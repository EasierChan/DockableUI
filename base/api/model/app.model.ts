"use strict";

export interface IApp {
    id: string;
    name: string;
    desc: string;
    category?: string;
    version?: string;
    author?: string;
}