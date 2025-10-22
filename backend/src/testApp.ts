import express from "express";
import app from "./app";
import authRouter from "./routes/auth";

// Compose a test app that wires only the routes needed for HTTP tests
// We intentionally keep this minimal to avoid side-effects (no sockets/stripe webhook)
const testApp = app;

// JSON parser for request bodies
testApp.use(express.json());

// Mount only the routers under test
testApp.use("/api/auth", authRouter);

export default testApp;
