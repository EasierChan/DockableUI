"use strict";

export interface IApp {
    id: string;
    name: string;
    desc: string;
    category: string;
    version?: string;
    author?: string;
}

export interface UserProfile {
    username: string;
    password: string;
    roles: string[];
    apps: string[];
}