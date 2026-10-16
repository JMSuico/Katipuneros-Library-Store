---
title: Katipuneros Library Store - Obsidian Vault Index
created: 2026-10-16
tags: [index, dashboard, architecture, memory]
---

# 📚 Katipuneros Library Store — Obsidian Vault

Welcome to the **Katipuneros Library Store System Knowledge Vault & Agent Memory System**.

> [!INFO] Project Architecture Overview
> - **Frontend**: React 19 + TypeScript + Vite (`Frontend/`) on Port 5173 (Customer & Cashier) and Port 5174 (Admin)
> - **Backend**: .NET 10 ASP.NET Core Web API (`Backend/`) on Port 5000
> - **Database**: SQL Server Express (`KatipunerosLibraryDb`) with EF Core 10 + Dapper
> - **Cache**: Redis Cache-Aside (`katipuneros:*`)
> - **Authentication**: JWT Bearer + BCrypt Password Hashing + Role-Based Access Control (`Customer`, `Cashier`, `Admin`)

## 🗺️ Quick Links & MOCs
- [[01-Architecture-Wiki/Frontend-Flowchain]] — React 19 UI, component hierarchy, and endpoints
- [[01-Architecture-Wiki/Backend-Flowchain]] — ASP.NET Core Controllers, Services, Repositories
- [[01-Architecture-Wiki/Database-Schema]] — SQL Server Tables, DDL, relationships, and constraints
- [[01-Architecture-Wiki/Redis-Cache-Design]] — Cache keys, TTLs, and invalidation triggers
- [[01-Architecture-Wiki/CRUD-Verification-Playbook]] — Full-Stack Verification & Bug-Hunting Protocol
- [[02-Knowledge-Graph/GRAPH_REPORT]] — Architecture hubs, coupling matrix, god nodes
- [[03-Agent-Memory/MEMORY]] — Agent memory discipline, active projects, and system invariants
- [[04-Task-Observer-Log/observation-log]] — Engineering lessons, patterns, and anti-patterns
- [[05-Harness-Engineering/Loop-Eng-Contracts]] — Autonomous loop-eng verify commands and invariants

## 🧭 Visual Canvases
- `07-Canvases/FullStack-Flowchain.canvas`
