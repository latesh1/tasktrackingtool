<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\Project;
use App\Models\Tag;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\TaskComment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Users
        $defaultPassword = Hash::make('password123');

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Sarah Admin',
                'password' => $defaultPassword,
                'role' => User::ROLE_ADMIN,
            ]
        );

        $manager1 = User::firstOrCreate(
            ['email' => 'manager1@example.com'],
            [
                'name' => 'Alex Rivera (Manager)',
                'password' => $defaultPassword,
                'role' => User::ROLE_MANAGER,
            ]
        );

        $manager2 = User::firstOrCreate(
            ['email' => 'manager2@example.com'],
            [
                'name' => 'Marcus Chen (Manager)',
                'password' => $defaultPassword,
                'role' => User::ROLE_MANAGER,
            ]
        );

        $members = [];
        $memberData = [
            ['name' => 'Emily Watson', 'email' => 'member1@example.com'],
            ['name' => 'David Kim', 'email' => 'member2@example.com'],
            ['name' => 'Jessica Taylor', 'email' => 'member3@example.com'],
            ['name' => 'James Wilson', 'email' => 'member4@example.com'],
            ['name' => 'Sophia Martinez', 'email' => 'member5@example.com'],
        ];

        foreach ($memberData as $m) {
            $members[] = User::firstOrCreate(
                ['email' => $m['email']],
                [
                    'name' => $m['name'],
                    'password' => $defaultPassword,
                    'role' => User::ROLE_MEMBER,
                ]
            );
        }

        $allUsers = array_merge([$admin, $manager1, $manager2], $members);

        // 2. Create Tags
        $tagDefinitions = [
            ['name' => 'Frontend', 'color' => '#3b82f6'],
            ['name' => 'Backend', 'color' => '#10b981'],
            ['name' => 'Bug', 'color' => '#ef4444'],
            ['name' => 'Urgent', 'color' => '#f97316'],
            ['name' => 'Feature', 'color' => '#8b5cf6'],
            ['name' => 'Documentation', 'color' => '#6b7280'],
            ['name' => 'Security', 'color' => '#dc2626'],
            ['name' => 'DevOps', 'color' => '#06b6d4'],
            ['name' => 'UI/UX', 'color' => '#ec4899'],
            ['name' => 'API', 'color' => '#14b8a6'],
        ];

        $tags = [];
        foreach ($tagDefinitions as $tagDef) {
            $tags[$tagDef['name']] = Tag::firstOrCreate(
                ['name' => $tagDef['name']],
                ['color' => $tagDef['color']]
            );
        }

        // 3. Create 3 Projects
        $project1 = Project::firstOrCreate(
            ['name' => 'SaaS Cloud Migration & Microservices'],
            [
                'description' => 'Modernizing legacy monolith into decoupled microservices deployed on AWS with Kubernetes orchestration and CI/CD pipelines.',
                'status' => 'active',
                'created_by' => $manager1->id,
            ]
        );

        $project2 = Project::firstOrCreate(
            ['name' => 'Mobile App Redesign (iOS & Android)'],
            [
                'description' => 'Revamping the core mobile user experience with responsive design, offline synchronization, and push notifications.',
                'status' => 'active',
                'created_by' => $manager2->id,
            ]
        );

        $project3 = Project::firstOrCreate(
            ['name' => 'Enterprise Security & SOC2 Compliance'],
            [
                'description' => 'Implementing zero-trust architecture, automated audit logging, rate limiting, and vulnerability remediation for enterprise compliance.',
                'status' => 'active',
                'created_by' => $admin->id,
            ]
        );

        $projects = [$project1, $project2, $project3];

        // 4. Create 32+ Tasks
        $taskDefinitions = [
            // Project 1: Cloud Migration
            [
                'project_id' => $project1->id,
                'title' => 'Design Docker containerization strategy for backend services',
                'description' => 'Create optimized multi-stage Dockerfiles for Laravel PHP 8.2 and worker nodes with minimal image footprint.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_DONE,
                'due_date' => Carbon::now()->subDays(5),
                'assigned_to' => $members[0]->id,
                'created_by' => $manager1->id,
                'completed_at' => Carbon::now()->subDays(2),
                'tags' => ['DevOps', 'Backend'],
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Configure Kubernetes cluster ingress and TLS certificates',
                'description' => 'Setup Traefik ingress controller and automated Let\'s Encrypt certificate renewal via cert-manager.',
                'priority' => Task::PRIORITY_URGENT,
                'status' => Task::STATUS_IN_PROGRESS,
                'due_date' => Carbon::now()->addDays(2),
                'assigned_to' => $members[1]->id,
                'created_by' => $manager1->id,
                'tags' => ['DevOps', 'Security', 'Urgent'],
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Migrate MySQL database to AWS Aurora with zero downtime',
                'description' => 'Setup AWS DMS replication task and perform validation benchmarks before traffic cutover.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(7),
                'assigned_to' => $members[0]->id,
                'created_by' => $manager1->id,
                'tags' => ['Backend', 'DevOps'],
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Set up centralized logging with OpenTelemetry and Grafana Loki',
                'description' => 'Collect structured JSON logs from all services and build query dashboards in Grafana.',
                'priority' => Task::PRIORITY_MEDIUM,
                'status' => Task::STATUS_BLOCKED,
                'due_date' => Carbon::now()->subDays(2), // Overdue!
                'assigned_to' => $members[2]->id,
                'created_by' => $manager1->id,
                'tags' => ['DevOps', 'Backend'],
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Implement distributed Redis caching layer',
                'description' => 'Cache hot queries and user sessions in clustered Redis instance to reduce DB load by 40%.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_IN_PROGRESS,
                'due_date' => Carbon::now()->addDays(3),
                'assigned_to' => $members[3]->id,
                'created_by' => $manager1->id,
                'tags' => ['Backend', 'Feature'],
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Write end-to-end integration tests for payment webhooks',
                'description' => 'Simulate Stripe webhooks for charge success, failure, and refunds under network partitions.',
                'priority' => Task::PRIORITY_MEDIUM,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(10),
                'assigned_to' => $members[0]->id,
                'created_by' => $manager1->id,
                'tags' => ['Backend', 'Documentation'],
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Refactor legacy synchronous background jobs to asynchronous queues',
                'description' => 'Transition PDF invoice generation and welcome emails to SQS queue workers.',
                'priority' => Task::PRIORITY_MEDIUM,
                'status' => Task::STATUS_DONE,
                'due_date' => Carbon::now()->subDays(10),
                'assigned_to' => $members[4]->id,
                'created_by' => $manager1->id,
                'completed_at' => Carbon::now()->subDays(8),
                'tags' => ['Backend'],
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Fix connection pool exhaustion in database worker nodes',
                'description' => 'High concurrent load triggers "Too many connections" error. Need PgBouncer/ProxySQL tuning.',
                'priority' => Task::PRIORITY_URGENT,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->subDays(1), // Overdue!
                'assigned_to' => $members[1]->id,
                'created_by' => $admin->id,
                'tags' => ['Bug', 'Urgent', 'Backend'],
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Update Terraform infrastructure scripts with staging VPC',
                'description' => 'Standardize module outputs and implement remote state locking with DynamoDB.',
                'priority' => Task::PRIORITY_LOW,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(14),
                'assigned_to' => null,
                'created_by' => $manager1->id,
                'tags' => ['DevOps'],
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Benchmark latency before and after cloud migration',
                'description' => 'Execute Apache JMeter test suites simulating 5,000 requests/sec and record p95/p99 numbers.',
                'priority' => Task::PRIORITY_MEDIUM,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(18),
                'assigned_to' => $members[2]->id,
                'created_by' => $manager1->id,
                'tags' => ['DevOps', 'Documentation'],
            ],

            // Project 2: Mobile App Redesign
            [
                'project_id' => $project2->id,
                'title' => 'Implement Figma design tokens in React Native components',
                'description' => 'Export color palettes, typography scale, and elevation shadows to Tailwind config and mobile theme.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_DONE,
                'due_date' => Carbon::now()->subDays(4),
                'assigned_to' => $members[2]->id,
                'created_by' => $manager2->id,
                'completed_at' => Carbon::now()->subDays(3),
                'tags' => ['Frontend', 'UI/UX'],
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Build offline task cache with SQLite and background sync',
                'description' => 'Allow users to draft tasks and comments without internet connection; sync automatically upon reconnect.',
                'priority' => Task::PRIORITY_URGENT,
                'status' => Task::STATUS_IN_PROGRESS,
                'due_date' => Carbon::now()->addDays(1),
                'assigned_to' => $members[3]->id,
                'created_by' => $manager2->id,
                'tags' => ['Frontend', 'Feature', 'Urgent'],
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Resolve biometric authentication face-id crash on iOS 18',
                'description' => 'App crashes intermittently when user cancels FaceID prompt and falls back to passcode.',
                'priority' => Task::PRIORITY_URGENT,
                'status' => Task::STATUS_IN_PROGRESS,
                'due_date' => Carbon::now()->subDays(3), // Overdue!
                'assigned_to' => $members[2]->id,
                'created_by' => $manager2->id,
                'tags' => ['Bug', 'Urgent', 'Frontend'],
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Design sleek dark mode theme with accessible contrast',
                'description' => 'Audit all views to guarantee WCAG AAA compliance on dark mode elements and badges.',
                'priority' => Task::PRIORITY_MEDIUM,
                'status' => Task::STATUS_DONE,
                'due_date' => Carbon::now()->subDays(6),
                'assigned_to' => $members[4]->id,
                'created_by' => $manager2->id,
                'completed_at' => Carbon::now()->subDays(4),
                'tags' => ['UI/UX', 'Frontend'],
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Optimize mobile bundle size and lazy load heavy charting modules',
                'description' => 'Bundle size exceeds 45MB. Need code splitting and SVG icon asset optimization.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_BLOCKED,
                'due_date' => Carbon::now()->addDays(4),
                'assigned_to' => $members[3]->id,
                'created_by' => $manager2->id,
                'tags' => ['Frontend', 'UI/UX'],
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Implement push notifications for task assignment & mentions',
                'description' => 'Integrate Firebase Cloud Messaging (FCM) and Apple APNs tokens with backend webhook handlers.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(5),
                'assigned_to' => $members[1]->id,
                'created_by' => $manager2->id,
                'tags' => ['Feature', 'API'],
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Create interactive swipe-to-complete gesture on task items',
                'description' => 'Add fluid haptic feedback and spring animations when swiping a task to "done" state.',
                'priority' => Task::PRIORITY_LOW,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(8),
                'assigned_to' => $members[4]->id,
                'created_by' => $manager2->id,
                'tags' => ['UI/UX', 'Frontend'],
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Fix deep link routing when clicking push notification',
                'description' => 'Deep link to specific task detail drawer occasionally opens main dashboard instead.',
                'priority' => Task::PRIORITY_MEDIUM,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(6),
                'assigned_to' => $members[2]->id,
                'created_by' => $manager2->id,
                'tags' => ['Bug', 'Frontend'],
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Publish beta release build to Apple TestFlight and Google Play Beta',
                'description' => 'Generate signed release IPAs and AABs, configure release notes, and invite internal testing team.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(12),
                'assigned_to' => $members[3]->id,
                'created_by' => $manager2->id,
                'tags' => ['DevOps', 'Frontend'],
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Conduct user usability testing session with 10 beta testers',
                'description' => 'Record screen sessions and summarize friction points in task creation flow.',
                'priority' => Task::PRIORITY_LOW,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(15),
                'assigned_to' => $members[4]->id,
                'created_by' => $manager2->id,
                'tags' => ['UI/UX', 'Documentation'],
            ],

            // Project 3: Enterprise Security & Compliance
            [
                'project_id' => $project3->id,
                'title' => 'Audit Sanctum token expiration and implement sliding sessions',
                'description' => 'Ensure API tokens expire properly and implement revocation on password change or logout.',
                'priority' => Task::PRIORITY_URGENT,
                'status' => Task::STATUS_DONE,
                'due_date' => Carbon::now()->subDays(7),
                'assigned_to' => $members[0]->id,
                'created_by' => $admin->id,
                'completed_at' => Carbon::now()->subDays(5),
                'tags' => ['Security', 'API', 'Backend'],
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Enforce granular role-based authorization via Laravel Policies',
                'description' => 'Prevent privilege escalation by restricting admin-only endpoints and validating resource ownership.',
                'priority' => Task::PRIORITY_URGENT,
                'status' => Task::STATUS_DONE,
                'due_date' => Carbon::now()->subDays(3),
                'assigned_to' => $members[1]->id,
                'created_by' => $admin->id,
                'completed_at' => Carbon::now()->subDays(2),
                'tags' => ['Security', 'Backend'],
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Setup automated Dependabot and Snyk dependency vulnerability scanning',
                'description' => 'Scan PHP and Node.js dependencies daily for known CVEs and block CI pipelines on critical alerts.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_IN_PROGRESS,
                'due_date' => Carbon::now(), // Due today!
                'assigned_to' => $members[0]->id,
                'created_by' => $admin->id,
                'tags' => ['Security', 'DevOps'],
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Implement strict rate limiting on authentication and sensitive APIs',
                'description' => 'Limit login attempts to 5 per minute per IP address and return 429 Too Many Requests.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_IN_PROGRESS,
                'due_date' => Carbon::now()->addDays(2),
                'assigned_to' => $members[1]->id,
                'created_by' => $admin->id,
                'tags' => ['Security', 'API'],
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Perform database encryption at rest and in transit (TLS 1.3)',
                'description' => 'Verify AES-256 storage volume encryption and enforce SSL connections from all application servers.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(9),
                'assigned_to' => $members[0]->id,
                'created_by' => $admin->id,
                'tags' => ['Security', 'Backend'],
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Remediate stored XSS vulnerability in task description renderer',
                'description' => 'Sanitize rich HTML descriptions before rendering to prevent malicious script injection.',
                'priority' => Task::PRIORITY_URGENT,
                'status' => Task::STATUS_BLOCKED,
                'due_date' => Carbon::now()->subDays(4), // Overdue!
                'assigned_to' => $members[2]->id,
                'created_by' => $admin->id,
                'tags' => ['Bug', 'Security', 'Urgent', 'Frontend'],
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Draft SOC2 Type II internal control documentation',
                'description' => 'Document change management, access control reviews, and disaster recovery procedures.',
                'priority' => Task::PRIORITY_MEDIUM,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(14),
                'assigned_to' => $manager1->id,
                'created_by' => $admin->id,
                'tags' => ['Documentation', 'Security'],
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Implement audit log streaming to immutable S3 compliance bucket',
                'description' => 'Forward all TaskActivity entries and user login records with Object Lock enabled.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(11),
                'assigned_to' => $members[1]->id,
                'created_by' => $admin->id,
                'tags' => ['Security', 'Backend'],
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Conduct external penetration test and remediate findings',
                'description' => 'Engage third-party security firm for gray-box API and web penetration assessment.',
                'priority' => Task::PRIORITY_URGENT,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(20),
                'assigned_to' => $admin->id,
                'created_by' => $admin->id,
                'tags' => ['Security', 'Urgent'],
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Implement multi-factor authentication (MFA) via TOTP',
                'description' => 'Allow users to pair Google Authenticator or 1Password with QR code backup codes.',
                'priority' => Task::PRIORITY_MEDIUM,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(16),
                'assigned_to' => $members[0]->id,
                'created_by' => $admin->id,
                'tags' => ['Feature', 'Security'],
            ],
            // General / Standalone Tasks (nullable project_id)
            [
                'project_id' => null,
                'title' => 'Conduct quarterly sprint planning & resource allocation',
                'description' => 'Review roadmap milestones, developer velocity, and cross-team dependencies for upcoming quarter.',
                'priority' => Task::PRIORITY_HIGH,
                'status' => Task::STATUS_DONE,
                'due_date' => Carbon::now()->subDays(1),
                'assigned_to' => $manager1->id,
                'created_by' => $admin->id,
                'completed_at' => Carbon::now()->subHours(12),
                'tags' => ['Documentation'],
            ],
            [
                'project_id' => null,
                'title' => 'Update developer onboarding handbook and setup scripts',
                'description' => 'Refresh Docker compose instructions and seed database credentials in documentation.',
                'priority' => Task::PRIORITY_LOW,
                'status' => Task::STATUS_TODO,
                'due_date' => Carbon::now()->addDays(7),
                'assigned_to' => $members[4]->id,
                'created_by' => $manager1->id,
                'tags' => ['Documentation'],
            ],
        ];

        $createdTasks = [];
        foreach ($taskDefinitions as $def) {
            $tagNames = $def['tags'] ?? [];
            unset($def['tags']);

            $task = Task::create($def);
            $createdTasks[] = $task;

            // Attach tags
            $tagIds = [];
            foreach ($tagNames as $name) {
                if (isset($tags[$name])) {
                    $tagIds[] = $tags[$name]->id;
                }
            }
            $task->tags()->sync($tagIds);

            // Log activity: created
            TaskActivity::create([
                'task_id' => $task->id,
                'user_id' => $task->created_by,
                'action' => 'created',
                'old_value' => null,
                'new_value' => $task->title,
                'metadata' => [
                    'priority' => $task->priority,
                    'status' => $task->status,
                ],
                'created_at' => $task->created_at,
            ]);

            // If task has assignee, log assignment activity
            if ($task->assigned_to) {
                TaskActivity::create([
                    'task_id' => $task->id,
                    'user_id' => $task->created_by,
                    'action' => 'assigned',
                    'old_value' => null,
                    'new_value' => (string) $task->assigned_to,
                    'metadata' => ['assignee_id' => $task->assigned_to],
                    'created_at' => $task->created_at->addMinutes(5),
                ]);
            }
        }

        // 5. Create Subtasks for complex tasks
        $parentTask1 = $createdTasks[1]; // Configure Kubernetes cluster
        $subtask1 = Task::create([
            'project_id' => $parentTask1->project_id,
            'parent_task_id' => $parentTask1->id,
            'title' => 'Install Traefik Helm chart on k8s master node',
            'description' => 'Deploy Traefik with custom values.yaml and load balancer service.',
            'priority' => Task::PRIORITY_HIGH,
            'status' => Task::STATUS_DONE,
            'due_date' => Carbon::now()->addDays(1),
            'assigned_to' => $members[1]->id,
            'created_by' => $manager1->id,
            'completed_at' => Carbon::now()->subHours(6),
        ]);
        $subtask2 = Task::create([
            'project_id' => $parentTask1->project_id,
            'parent_task_id' => $parentTask1->id,
            'title' => 'Configure Cloudflare DNS API tokens for cert-manager',
            'description' => 'Store Cloudflare secret in sealed-secrets namespace for DNS01 challenge.',
            'priority' => Task::PRIORITY_HIGH,
            'status' => Task::STATUS_DONE,
            'due_date' => Carbon::now()->addDays(2),
            'assigned_to' => $members[1]->id,
            'created_by' => $manager1->id,
            'completed_at' => Carbon::now()->subHours(2),
        ]);
        $subtask3 = Task::create([
            'project_id' => $parentTask1->project_id,
            'parent_task_id' => $parentTask1->id,
            'title' => 'Verify automatic HTTPS redirect and test SSL Labs rating',
            'description' => 'Target A+ rating on Qualys SSL Labs analysis.',
            'priority' => Task::PRIORITY_MEDIUM,
            'status' => Task::STATUS_IN_PROGRESS,
            'due_date' => Carbon::now()->addDays(2),
            'assigned_to' => $members[1]->id,
            'created_by' => $manager1->id,
        ]);

        $parentTask2 = $createdTasks[11]; // Offline task cache
        $subtask4 = Task::create([
            'project_id' => $parentTask2->project_id,
            'parent_task_id' => $parentTask2->id,
            'title' => 'Implement SQLite local database schema migration',
            'description' => 'Create local tasks and outbox transaction tables.',
            'priority' => Task::PRIORITY_HIGH,
            'status' => Task::STATUS_DONE,
            'due_date' => Carbon::now()->subDays(1),
            'assigned_to' => $members[3]->id,
            'created_by' => $manager2->id,
            'completed_at' => Carbon::now()->subHours(10),
        ]);
        $subtask5 = Task::create([
            'project_id' => $parentTask2->project_id,
            'parent_task_id' => $parentTask2->id,
            'title' => 'Write conflict resolution logic using last-write-wins timestamp',
            'description' => 'Handle sync conflicts gracefully without data loss.',
            'priority' => Task::PRIORITY_HIGH,
            'status' => Task::STATUS_IN_PROGRESS,
            'due_date' => Carbon::now()->addDays(1),
            'assigned_to' => $members[3]->id,
            'created_by' => $manager2->id,
        ]);

        // 6. Create Task Comments
        $commentsData = [
            [
                'task' => $createdTasks[1],
                'user' => $members[1],
                'comment' => 'Traefik ingress controller is up and handling traffic. Testing cert-manager certificates now.',
            ],
            [
                'task' => $createdTasks[1],
                'user' => $manager1,
                'comment' => 'Great progress David! Please make sure staging domain is tested before applying to prod.',
            ],
            [
                'task' => $createdTasks[3], // Blocked logging task
                'user' => $members[2],
                'comment' => 'Blocked waiting for AWS IAM role permissions for OpenTelemetry collector.',
            ],
            [
                'task' => $createdTasks[3],
                'user' => $admin,
                'comment' => 'IAM policy has been granted. Please verify access and resume setup.',
            ],
            [
                'task' => $createdTasks[12], // iOS biometric crash
                'user' => $members[2],
                'comment' => 'Identified root cause: unhandled Promise rejection in LocalAuthentication SDK on iOS 18 beta.',
            ],
            [
                'task' => $createdTasks[22], // Dependency scan
                'user' => $members[0],
                'comment' => 'Snyk detected 2 moderate vulnerabilities in sub-dependencies. Upgrading packages now.',
            ],
        ];

        foreach ($commentsData as $c) {
            $comment = TaskComment::create([
                'task_id' => $c['task']->id,
                'user_id' => $c['user']->id,
                'comment' => $c['comment'],
            ]);

            TaskActivity::create([
                'task_id' => $c['task']->id,
                'user_id' => $c['user']->id,
                'action' => 'comment_added',
                'old_value' => null,
                'new_value' => substr($c['comment'], 0, 100),
                'metadata' => ['comment_id' => $comment->id],
            ]);
        }

        // 7. Create In-App Notifications
        $notificationData = [
            [
                'user_id' => $members[1]->id,
                'task_id' => $createdTasks[1]->id,
                'type' => 'task_assigned',
                'title' => 'New Task Assigned',
                'message' => 'You were assigned to "Configure Kubernetes cluster ingress and TLS certificates" by Alex Rivera.',
                'read_at' => null,
            ],
            [
                'user_id' => $members[2]->id,
                'task_id' => $createdTasks[3]->id,
                'type' => 'status_changed',
                'title' => 'Task Blocked',
                'message' => 'Task "Set up centralized logging" was marked as blocked.',
                'read_at' => null,
            ],
            [
                'user_id' => $members[1]->id,
                'task_id' => $createdTasks[7]->id,
                'type' => 'task_overdue',
                'title' => 'Task Overdue Notice',
                'message' => 'Task "Fix connection pool exhaustion in database worker nodes" is past its due date.',
                'read_at' => null,
            ],
            [
                'user_id' => $admin->id,
                'task_id' => $createdTasks[20]->id,
                'type' => 'task_completed',
                'title' => 'Task Completed',
                'message' => 'Task "Audit Sanctum token expiration" has been marked done by Emily Watson.',
                'read_at' => Carbon::now()->subDay(),
            ],
            [
                'user_id' => $manager1->id,
                'task_id' => $createdTasks[0]->id,
                'type' => 'task_completed',
                'title' => 'Task Completed',
                'message' => 'Task "Design Docker containerization strategy" has been marked done.',
                'read_at' => null,
            ],
        ];

        foreach ($notificationData as $n) {
            Notification::create($n);
        }
    }
}
