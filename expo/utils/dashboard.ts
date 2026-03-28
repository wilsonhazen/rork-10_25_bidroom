import {
  Job,
  JobApplication,
  Bid,
  Project,
  Milestone,
  Appointment,
  UserRole,
} from "@/types";

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  pendingPayments: number;
  completionRate: number;
  avgProjectDuration: number;
}

export interface WorkflowMetrics {
  jobsPosted: number;
  jobsFilled: number;
  applicationsPending: number;
  applicationsAccepted: number;
  appointmentsScheduled: number;
  bidsAwarded: number;
  milestonesCompleted: number;
  milestonesTotal: number;
}

export interface AlertItem {
  id: string;
  type: "warning" | "info" | "error" | "success";
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
}

export function calculateProjectStats(projects: Project[]): DashboardStats {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  
  const totalRevenue = projects
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.paidAmount, 0);
  
  const pendingPayments = projects
    .filter(p => p.status === "active")
    .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0);
  
  const completionRate = totalProjects > 0 
    ? Math.round((completedProjects / totalProjects) * 100) 
    : 0;
  
  const projectDurations = projects
    .filter(p => p.actualEndDate && p.actualStartDate)
    .map(p => {
      const start = new Date(p.actualStartDate!).getTime();
      const end = new Date(p.actualEndDate!).getTime();
      return Math.round((end - start) / (1000 * 60 * 60 * 24));
    });
  
  const avgProjectDuration = projectDurations.length > 0
    ? Math.round(projectDurations.reduce((a, b) => a + b, 0) / projectDurations.length)
    : 0;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalRevenue,
    pendingPayments,
    completionRate,
    avgProjectDuration,
  };
}

export function calculateWorkflowMetrics(
  jobs: Job[],
  applications: JobApplication[],
  bids: Bid[],
  appointments: Appointment[],
  milestones: Milestone[]
): WorkflowMetrics {
  return {
    jobsPosted: jobs.length,
    jobsFilled: jobs.filter(j => j.status === "in_progress" || j.status === "completed").length,
    applicationsPending: applications.filter(a => a.status === "pending").length,
    applicationsAccepted: applications.filter(a => a.status === "accepted").length,
    appointmentsScheduled: appointments.filter(a => a.status === "scheduled").length,
    bidsAwarded: bids.filter(b => b.status === "awarded").length,
    milestonesCompleted: milestones.filter(m => m.status === "approved").length,
    milestonesTotal: milestones.length,
  };
}

export function generateAlerts(
  projects: Project[],
  milestones: Milestone[],
  applications: JobApplication[],
  appointments: Appointment[]
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const now = new Date();

  projects.forEach(project => {
    if (project.status === "active") {
      const endDate = new Date(project.endDate);
      const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
        alerts.push({
          id: `project-deadline-${project.id}`,
          type: "warning",
          title: "Project Deadline Approaching",
          message: `${project.title} is due in ${daysUntilEnd} days`,
          actionUrl: `/project-dashboard?id=${project.id}`,
          createdAt: now.toISOString(),
        });
      } else if (daysUntilEnd < 0) {
        alerts.push({
          id: `project-overdue-${project.id}`,
          type: "error",
          title: "Project Overdue",
          message: `${project.title} is ${Math.abs(daysUntilEnd)} days overdue`,
          actionUrl: `/project-dashboard?id=${project.id}`,
          createdAt: now.toISOString(),
        });
      }

      if (project.completionPercentage < 50 && daysUntilEnd <= 30) {
        alerts.push({
          id: `project-behind-${project.id}`,
          type: "warning",
          title: "Project Behind Schedule",
          message: `${project.title} is only ${project.completionPercentage}% complete`,
          actionUrl: `/project-dashboard?id=${project.id}`,
          createdAt: now.toISOString(),
        });
      }
    }
  });

  milestones.forEach(milestone => {
    if (milestone.status === "pending_review") {
      const submittedDays = Math.ceil(
        (now.getTime() - new Date(milestone.submittedAt!).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (submittedDays >= 3) {
        alerts.push({
          id: `milestone-review-${milestone.id}`,
          type: "warning",
          title: "Milestone Awaiting Review",
          message: `"${milestone.title}" has been pending review for ${submittedDays} days`,
          actionUrl: `/project-dashboard?id=${milestone.projectId}`,
          createdAt: now.toISOString(),
        });
      }
    }

    if (milestone.status === "in_progress") {
      const dueDate = new Date(milestone.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        alerts.push({
          id: `milestone-overdue-${milestone.id}`,
          type: "error",
          title: "Milestone Overdue",
          message: `"${milestone.title}" is ${Math.abs(daysUntilDue)} days overdue`,
          actionUrl: `/project-dashboard?id=${milestone.projectId}`,
          createdAt: now.toISOString(),
        });
      }
    }
  });

  const pendingApplications = applications.filter(a => a.status === "pending");
  if (pendingApplications.length > 5) {
    alerts.push({
      id: "applications-pending",
      type: "info",
      title: "Pending Applications",
      message: `You have ${pendingApplications.length} applications awaiting review`,
      actionUrl: "/jobs",
      createdAt: now.toISOString(),
    });
  }

  appointments.forEach(appointment => {
    if (appointment.status === "scheduled") {
      const appointmentDate = new Date(appointment.date);
      const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntil <= 24 && hoursUntil > 0) {
        alerts.push({
          id: `appointment-reminder-${appointment.id}`,
          type: "info",
          title: "Upcoming Appointment",
          message: `${appointment.title} in ${Math.round(hoursUntil)} hours`,
          actionUrl: `/appointment-details?id=${appointment.id}`,
          createdAt: now.toISOString(),
        });
      }
    }
  });

  return alerts.sort((a, b) => {
    const priorityOrder = { error: 0, warning: 1, info: 2, success: 3 };
    return priorityOrder[a.type] - priorityOrder[b.type];
  });
}

export function getProjectPhase(project: Project, milestones: Milestone[]): string {
  if (project.status === "setup") return "Setup";
  if (project.status === "completed") return "Completed";
  if (project.status === "cancelled") return "Cancelled";
  if (project.status === "on_hold") return "On Hold";

  const projectMilestones = milestones.filter(m => m.projectId === project.id);
  if (projectMilestones.length === 0) return "Planning";

  const completedCount = projectMilestones.filter(m => m.status === "approved").length;
  const totalCount = projectMilestones.length;
  
  const percentComplete = (completedCount / totalCount) * 100;

  if (percentComplete === 0) return "Getting Started";
  if (percentComplete < 33) return "Early Stage";
  if (percentComplete < 66) return "Mid Construction";
  if (percentComplete < 100) return "Final Stage";
  return "Final Inspection";
}

export function getNextActions(
  role: UserRole,
  projects: Project[],
  milestones: Milestone[],
  applications: JobApplication[],
  bids: Bid[]
): { id: string; title: string; description: string; actionUrl: string; priority: "high" | "medium" | "low" }[] {
  const actions: { id: string; title: string; description: string; actionUrl: string; priority: "high" | "medium" | "low" }[] = [];

  if (role === "Project Manager" || role === "Admin") {
    const pendingMilestones = milestones.filter(m => m.status === "pending_review");
    pendingMilestones.forEach(milestone => {
      const project = projects.find(p => p.id === milestone.projectId);
      if (project) {
        actions.push({
          id: `review-milestone-${milestone.id}`,
          title: "Review Milestone",
          description: `"${milestone.title}" on ${project.title}`,
          actionUrl: `/project-dashboard?id=${project.id}`,
          priority: "high",
        });
      }
    });

    const pendingApplications = applications.filter(a => a.status === "pending");
    if (pendingApplications.length > 0) {
      actions.push({
        id: "review-applications",
        title: "Review Applications",
        description: `${pendingApplications.length} applications need your attention`,
        actionUrl: "/jobs",
        priority: "medium",
      });
    }

    const openBids = bids.filter(b => b.status === "pending" || b.status === "submitted");
    openBids.forEach(bid => {
      if (bid.submittedCount > 0) {
        actions.push({
          id: `review-bids-${bid.id}`,
          title: "Review Bid Submissions",
          description: `${bid.submittedCount} submissions for "${bid.projectName}"`,
          actionUrl: `/bid-details?id=${bid.id}`,
          priority: "medium",
        });
      }
    });
  }

  if (role === "GC" || role === "Subcontractor" || role === "Trade Specialist") {
    const inProgressMilestones = milestones.filter(
      m => m.status === "in_progress" || m.status === "not_started"
    );
    inProgressMilestones.forEach(milestone => {
      const project = projects.find(p => p.id === milestone.projectId);
      if (project) {
        const daysUntilDue = Math.ceil(
          (new Date(milestone.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDue <= 7) {
          actions.push({
            id: `complete-milestone-${milestone.id}`,
            title: "Complete Milestone",
            description: `"${milestone.title}" due in ${daysUntilDue} days`,
            actionUrl: `/project-dashboard?id=${project.id}`,
            priority: daysUntilDue <= 3 ? "high" : "medium",
          });
        }
      }
    });

    const needsRevisionMilestones = milestones.filter(m => m.status === "needs_revision");
    needsRevisionMilestones.forEach(milestone => {
      const project = projects.find(p => p.id === milestone.projectId);
      if (project) {
        actions.push({
          id: `revise-milestone-${milestone.id}`,
          title: "Revise Milestone",
          description: `"${milestone.title}" needs revisions`,
          actionUrl: `/project-dashboard?id=${project.id}`,
          priority: "high",
        });
      }
    });

    const openBids = bids.filter(b => b.status === "pending");
    openBids.forEach(bid => {
      const daysUntilDue = Math.ceil(
        (new Date(bid.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDue <= 7 && daysUntilDue >= 0) {
        actions.push({
          id: `submit-bid-${bid.id}`,
          title: "Submit Bid",
          description: `"${bid.projectName}" due in ${daysUntilDue} days`,
          actionUrl: `/bid-details?id=${bid.id}`,
          priority: daysUntilDue <= 3 ? "high" : "low",
        });
      }
    });
  }

  return actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function calculateFinancialSummary(projects: Project[]): {
  totalContract: number;
  totalPaid: number;
  escrowHeld: number;
  remaining: number;
} {
  const totalContract = projects.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaid = projects.reduce((sum, p) => sum + p.paidAmount, 0);
  const escrowHeld = projects.reduce((sum, p) => sum + p.escrowBalance, 0);
  const remaining = totalContract - totalPaid;

  return {
    totalContract,
    totalPaid,
    escrowHeld,
    remaining,
  };
}

export function getProjectHealthStatus(project: Project, milestones: Milestone[]): {
  status: "on_track" | "at_risk" | "behind" | "ahead";
  reason: string;
} {
  if (project.status !== "active") {
    return { status: "on_track", reason: "Project not active" };
  }

  const now = new Date();
  const endDate = new Date(project.endDate);
  const startDate = new Date(project.startDate);
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const expectedProgress = (elapsed / totalDuration) * 100;

  const actualProgress = project.completionPercentage;

  const variance = actualProgress - expectedProgress;

  if (variance >= 10) {
    return { status: "ahead", reason: "Project ahead of schedule" };
  } else if (variance >= -10) {
    return { status: "on_track", reason: "Project on schedule" };
  } else if (variance >= -20) {
    return { status: "at_risk", reason: "Project slightly behind schedule" };
  } else {
    return { status: "behind", reason: "Project significantly behind schedule" };
  }
}
