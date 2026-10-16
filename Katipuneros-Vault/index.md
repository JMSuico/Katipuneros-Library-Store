---
title: Katipuneros Library Store - Obsidian Vault Index
created: 2026-10-16
updated: 2026-10-17
tags: [index, dashboard, architecture, memory, infrastructure, circulation]
---

# 📚 Katipuneros Library Store — Obsidian Vault

Welcome to the **Katipuneros Library Store System Knowledge Vault & Agent Memory System**.

> [!INFO] Production Architecture Overview
> - **Frontend Presentation (Layers 1–4)**: Nginx 1.27 Alpine + React 19 SPAs on Ports 5173 (Landing), 5176 (Customer), 5175 (Cashier), 5174 (Admin)
> - **Application API (Layer 5)**: .NET 10 ASP.NET Core Web API (`Backend/`) on Port 5000 with CQRS Dual `DbContext`
> - **Distributed Cache (Layer 6)**: Redis 7.2 Alpine (`katipuneros-redis`) with LRU Eviction & AOF Persistence on Port 6379
> - **Data Storage (Layers 7 & 8)**: PostgreSQL 16 Alpine High-Availability Cluster with Physical WAL Streaming Replication (Primary :5432, Read Replica :5433)
> - **Circulation & Identifiers**: Physical `BookCopy` volume accession codes (`KP-ACC-...`), QR code payloads (`KP:COPY:...`), ExpressCodes (`SCAN-BAY-XXXXXX`), and client-side downloadable User Slip PNGs
> - **Authentication & RBAC**: JWT Bearer + BCrypt Password Hashing + Role-Based Access Control (`Customer`, `Cashier`, `Admin`)

## 🗺️ Quick Links & Architecture MOCs
- [[01-Architecture-Wiki/8-Layer-Docker-Kubernetes-Architecture]] — Full 8-Layer Docker & Kubernetes Production Architecture
- [[01-Architecture-Wiki/Circulation-QRCode-and-UserSlip-Standard]] — Circulation QRCode, ExpressCode, and User Slip PNG Specification
- [[01-Architecture-Wiki/CRUD-Verification-Playbook]] — Full-Stack Verification & Bug-Hunting Protocol
- [[01-Architecture-Wiki/Frontend-Flowchain]] — React 19 UI, component hierarchy, and endpoints
- [[01-Architecture-Wiki/Backend-Flowchain]] — ASP.NET Core Controllers, Services, Repositories
- [[01-Architecture-Wiki/Database-Schema]] — Database Tables, DDL, relationships, and constraints
- [[01-Architecture-Wiki/Redis-Cache-Design]] — Cache keys, TTLs, and invalidation triggers
- [[02-Knowledge-Graph/GRAPH_REPORT]] — Architecture hubs, coupling matrix, god nodes
- [[03-Agent-Memory/MEMORY]] — Agent memory discipline, active projects, and system invariants
- [[04-Task-Observer-Log/2026-10-17-Production-Infrastructure-and-UserSlip-Log]] — Production Infrastructure, Multi-Port Topology & User Slip Engineering Log
- [[04-Task-Observer-Log/observation-log]] — Engineering lessons, patterns, and anti-patterns
- [[05-Harness-Engineering/Loop-Eng-Contracts]] — Autonomous loop-eng verify commands and invariants

## 🧭 Visual Canvases
- `07-Canvases/FullStack-Flowchain.canvas`
