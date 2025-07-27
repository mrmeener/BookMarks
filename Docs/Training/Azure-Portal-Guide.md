# Azure Portal Navigation Guide

**Document Version:** 1.1  
**Last Updated:** July 2025  
**Estimated Training Time:** 1.5 hours  
**Skill Level:** Beginner to Intermediate  
**Prerequisites:** Basic understanding of cloud computing concepts

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Portal Navigation](#portal-navigation)
4. [Resource Management](#resource-management)
5. [Monitoring & Diagnostics](#monitoring--diagnostics)
6. [Cost Management](#cost-management)
7. [Security & Access Control](#security--access-control)
8. [Common Tasks](#common-tasks)
9. [Tips & Best Practices](#tips--best-practices)

---

## Introduction

The Azure Portal is Microsoft's web-based management interface for Azure cloud services. This guide will help you navigate the portal efficiently and perform common administrative tasks.

### What You'll Learn
- Navigate the Azure Portal interface
- Manage Azure resources effectively
- Monitor resource performance and costs
- Implement security best practices
- Troubleshoot common issues

---

## Getting Started

### Accessing the Azure Portal
1. Navigate to [portal.azure.com](https://portal.azure.com)
2. Sign in with your Azure credentials
3. Select the appropriate directory/tenant if you have access to multiple

### Portal Overview
- **Top Navigation Bar**: Search, notifications, settings
- **Left Menu**: Main navigation panel
- **Dashboard**: Customizable overview of your resources
- **Resource Panels**: Detailed views of selected resources

### Subscription Management
- **View Subscriptions**: Click on "Subscriptions" in the left menu
- **Switch Subscriptions**: Use the subscription filter
- **Billing Information**: Access cost and billing details
- **Resource Limits**: Check subscription quotas and limits

---

## Portal Navigation

### Dashboard Customization
1. **Add Tiles**: Click "Edit dashboard" to add resource tiles
2. **Resize Tiles**: Drag corners to resize
3. **Move Tiles**: Drag and drop to rearrange
4. **Create Multiple Dashboards**: Organize by project or environment

### Search Functionality
- **Global Search**: Use the search bar at the top
- **Resource Search**: Find specific resources quickly
- **Service Search**: Locate Azure services
- **Documentation Search**: Access help articles

### Favorites and Pinning
- **Pin to Dashboard**: Pin frequently used resources
- **Add to Favorites**: Star services in the left menu
- **Recent Resources**: Access recently viewed items
- **Custom Shortcuts**: Create quick access links

---

## Resource Management

### Creating Resources
1. **Click "Create a resource"** in the left menu
2. **Browse Categories**: Explore available services
3. **Use Templates**: Deploy pre-configured solutions
4. **Marketplace**: Access third-party solutions

### Resource Groups
- **Organization**: Group related resources together
- **Lifecycle Management**: Deploy and delete resources as a unit
- **Access Control**: Apply permissions at the group level
- **Tagging**: Add metadata for organization and billing

### Resource Monitoring
- **Activity Log**: Track all operations on resources
- **Metrics**: Monitor performance indicators
- **Alerts**: Set up notifications for important events
- **Diagnostics**: Enable detailed logging

---

## Monitoring & Diagnostics

### Azure Monitor
- **Metrics Explorer**: Create custom performance charts
- **Log Analytics**: Query and analyze log data
- **Application Insights**: Monitor application performance
- **Service Health**: Check Azure service status

### Setting Up Alerts
1. **Navigate to Monitor** > **Alerts**
2. **Create Alert Rule**: Define conditions and actions
3. **Action Groups**: Configure notification methods
4. **Test Alerts**: Verify alert functionality

### Diagnostic Settings
- **Enable Diagnostics**: Turn on logging for resources
- **Log Destinations**: Send logs to storage, Log Analytics, or Event Hubs
- **Retention Policies**: Configure how long to keep logs
- **Cost Considerations**: Monitor logging costs

---

## Cost Management

### Cost Analysis
- **View Spending**: Analyze costs by resource, service, or time period
- **Budget Creation**: Set spending limits and alerts
- **Cost Recommendations**: Get suggestions to optimize spending
- **Export Data**: Download cost data for analysis

### Resource Optimization
- **Right-sizing**: Adjust resource sizes based on usage
- **Reserved Instances**: Purchase reserved capacity for savings
- **Spot Instances**: Use discounted compute capacity
- **Auto-shutdown**: Schedule VMs to shut down automatically

### Billing Management
- **Invoices**: Download and review monthly bills
- **Payment Methods**: Manage credit cards and payment options
- **Spending Limits**: Set up automatic spending controls
- **Cost Alerts**: Get notified when spending thresholds are reached

---

## Security & Access Control

### Azure Active Directory Integration
- **User Management**: Add and manage users
- **Group Management**: Create and manage security groups
- **Role Assignments**: Assign Azure roles to users and groups
- **Conditional Access**: Control access based on conditions

### Role-Based Access Control (RBAC)
- **Built-in Roles**: Use predefined roles (Owner, Contributor, Reader)
- **Custom Roles**: Create roles with specific permissions
- **Scope Assignment**: Apply roles at subscription, resource group, or resource level
- **Access Reviews**: Regularly review and update permissions

### Security Center
- **Security Score**: Monitor overall security posture
- **Recommendations**: Get security improvement suggestions
- **Threat Protection**: Enable advanced threat detection
- **Compliance**: Track compliance with security standards

---

## Common Tasks

### Virtual Machine Management
- **Create VM**: Deploy new virtual machines
- **Start/Stop**: Control VM power state
- **Resize**: Change VM size and performance
- **Backup**: Configure automated backups
- **Remote Access**: Connect via RDP or SSH

### Storage Account Operations
- **Create Storage**: Set up new storage accounts
- **Blob Management**: Upload and manage files
- **Access Keys**: Manage storage account keys
- **Shared Access Signatures**: Create time-limited access tokens

### Network Configuration
- **Virtual Networks**: Create and manage VNets
- **Subnets**: Configure network segmentation
- **Network Security Groups**: Set up firewall rules
- **Load Balancers**: Distribute traffic across resources

---

## Tips & Best Practices

### Navigation Tips
1. **Use Keyboard Shortcuts**: Press 'G+N' for navigation menu
2. **Pin Frequently Used Resources**: Add to dashboard or favorites
3. **Use Resource Groups**: Organize resources logically
4. **Leverage Search**: Quickly find resources and services
5. **Customize Dashboards**: Create role-specific views

### Security Best Practices
1. **Enable MFA**: Require multi-factor authentication
2. **Use RBAC**: Apply least privilege principle
3. **Regular Access Reviews**: Audit permissions quarterly
4. **Monitor Activity**: Review activity logs regularly
5. **Enable Security Center**: Use built-in security recommendations

### Cost Optimization
1. **Set Budgets**: Create spending alerts
2. **Use Tagging**: Track costs by project or department
3. **Regular Reviews**: Analyze spending monthly
4. **Right-size Resources**: Match capacity to actual needs
5. **Use Reserved Instances**: Save on predictable workloads

### Performance Optimization
1. **Monitor Metrics**: Track key performance indicators
2. **Set Up Alerts**: Get notified of performance issues
3. **Use Auto-scaling**: Automatically adjust capacity
4. **Regular Maintenance**: Keep resources updated
5. **Optimize Locations**: Choose regions close to users

---

## Troubleshooting Common Issues

### Access Problems
- **Check Permissions**: Verify RBAC assignments
- **Subscription Access**: Ensure access to correct subscription
- **Directory Issues**: Verify correct Azure AD tenant
- **MFA Problems**: Check multi-factor authentication setup

### Resource Deployment Failures
- **Check Quotas**: Verify subscription limits
- **Review Error Messages**: Read deployment error details
- **Validate Templates**: Check ARM template syntax
- **Resource Dependencies**: Ensure prerequisites are met

### Performance Issues
- **Check Resource Metrics**: Monitor CPU, memory, and network
- **Review Activity Logs**: Look for error patterns
- **Network Connectivity**: Test network connections
- **Service Health**: Check Azure service status

---

## Additional Resources

### Official Documentation
- [Azure Portal Documentation](https://docs.microsoft.com/azure/azure-portal/)
- [Azure Resource Manager](https://docs.microsoft.com/azure/azure-resource-manager/)
- [Azure Monitor](https://docs.microsoft.com/azure/azure-monitor/)

### Training Resources
- Microsoft Learn: Azure Fundamentals
- Pluralsight: Azure Administration
- Azure Architecture Center
- Azure Quickstart Templates

### Support Options
- **Azure Support Plans**: Professional support options
- **Community Forums**: Peer-to-peer assistance
- **Documentation**: Comprehensive online docs
- **Azure Advisor**: Personalized recommendations

---

**Document Control:**
- **Author:** Cloud Infrastructure Team
- **Reviewer:** Azure Architects
- **Next Review Date:** January 2026
- **Classification:** Internal Use Only

---

*This document is part of the Corporate Cloud Training Program. For questions or updates, contact the Cloud Infrastructure Team.*
