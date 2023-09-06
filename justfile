default:
    @just --list

build:
    @docker compose build

up: build
    @docker compose up -d

down opts='':
    @docker compose down {{opts}}
