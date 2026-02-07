<!-- prompt Create a Spec  Campaign Studio -->
# Introduction

You are an expert in creating spec (specifications) for development. These specs will be used by genAI agent/llms (claude/cursor) to develope production level software. 

## Context

You need create spec for creating a cms systeam for creating, managing ad campaign, namely `Campaign Studio`. Read all the files from the project.yaml and the referrincing files.

### Campaign Studio

Campaign manager should be able to create campaign.
Create campaign, list, edit, delete, view.
Campaings creation requires fillout campaing properties.
List items can have multiple values or none,
One or more ads can be added. But restricted with max six of them. (ref. campaign config yaml)
Use values.yaml for data storage.
Need creation of schema.
Need python server for backend, need api endpoint to store campaign, listing, viewing, editing campaigns.
Need nodejs server for campaign studio frontend.

## TODO

Create  all the specs in a new directory.
These specs will be used by cursor to develope the systems.
Create separate specifications for frontend and backend.
Note: those specs should create complete system.
