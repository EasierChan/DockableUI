"use strict";

export interface IApplication {
    bootstrap(): void;
    quit(): void;
    restart(): void;
}