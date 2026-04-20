import { z } from 'zod';

declare const LacStatusSchema: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
declare const LacStatusTransitionSchema: z.ZodObject<{
    from: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
    to: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
    date: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    from: "draft" | "active" | "frozen" | "deprecated";
    to: "draft" | "active" | "frozen" | "deprecated";
    date: string;
    reason?: string | undefined;
}, {
    from: "draft" | "active" | "frozen" | "deprecated";
    to: "draft" | "active" | "frozen" | "deprecated";
    date: string;
    reason?: string | undefined;
}>;
declare const LacAnnotationSchema: z.ZodObject<{
    id: z.ZodString;
    author: z.ZodString;
    date: z.ZodString;
    type: z.ZodString;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    type: string;
    id: string;
    author: string;
    body: string;
}, {
    date: string;
    type: string;
    id: string;
    author: string;
    body: string;
}>;
declare const LacFieldLockSchema: z.ZodObject<{
    field: z.ZodString;
    lockedAt: z.ZodString;
    lockedBy: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    field: string;
    lockedAt: string;
    lockedBy: string;
    reason?: string | undefined;
}, {
    field: string;
    lockedAt: string;
    lockedBy: string;
    reason?: string | undefined;
}>;
declare const LacNodeSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
    domain: z.ZodString;
    schemaVersion: z.ZodLiteral<2>;
    priority: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    owner: z.ZodOptional<z.ZodString>;
    jira: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    parent: z.ZodOptional<z.ZodString>;
    children: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    blockedBy: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    enables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    references: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    supersedes: z.ZodOptional<z.ZodString>;
    supersededBy: z.ZodOptional<z.ZodString>;
    fixes: z.ZodOptional<z.ZodString>;
    resolvedInto: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    statusHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
        from: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
        to: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
        date: z.ZodString;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        from: "draft" | "active" | "frozen" | "deprecated";
        to: "draft" | "active" | "frozen" | "deprecated";
        date: string;
        reason?: string | undefined;
    }, {
        from: "draft" | "active" | "frozen" | "deprecated";
        to: "draft" | "active" | "frozen" | "deprecated";
        date: string;
        reason?: string | undefined;
    }>, "many">>;
    annotations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        author: z.ZodString;
        date: z.ZodString;
        type: z.ZodString;
        body: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        date: string;
        type: string;
        id: string;
        author: string;
        body: string;
    }, {
        date: string;
        type: string;
        id: string;
        author: string;
        body: string;
    }>, "many">>;
    fieldLocks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        lockedAt: z.ZodString;
        lockedBy: z.ZodString;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        lockedAt: string;
        lockedBy: string;
        reason?: string | undefined;
    }, {
        field: string;
        lockedAt: string;
        lockedBy: string;
        reason?: string | undefined;
    }>, "many">>;
    nodeLocked: z.ZodOptional<z.ZodBoolean>;
    views: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: string;
    status: "draft" | "active" | "frozen" | "deprecated";
    id: string;
    title: string;
    domain: string;
    schemaVersion: 2;
    views: Record<string, Record<string, unknown>>;
    priority?: number | undefined;
    tags?: string[] | undefined;
    owner?: string | undefined;
    jira?: string | string[] | undefined;
    parent?: string | undefined;
    children?: string[] | undefined;
    blockedBy?: string[] | undefined;
    enables?: string[] | undefined;
    references?: string[] | undefined;
    supersedes?: string | undefined;
    supersededBy?: string | undefined;
    fixes?: string | undefined;
    resolvedInto?: string[] | undefined;
    statusHistory?: {
        from: "draft" | "active" | "frozen" | "deprecated";
        to: "draft" | "active" | "frozen" | "deprecated";
        date: string;
        reason?: string | undefined;
    }[] | undefined;
    annotations?: {
        date: string;
        type: string;
        id: string;
        author: string;
        body: string;
    }[] | undefined;
    fieldLocks?: {
        field: string;
        lockedAt: string;
        lockedBy: string;
        reason?: string | undefined;
    }[] | undefined;
    nodeLocked?: boolean | undefined;
}, {
    type: string;
    status: "draft" | "active" | "frozen" | "deprecated";
    id: string;
    title: string;
    domain: string;
    schemaVersion: 2;
    views: Record<string, Record<string, unknown>>;
    priority?: number | undefined;
    tags?: string[] | undefined;
    owner?: string | undefined;
    jira?: string | string[] | undefined;
    parent?: string | undefined;
    children?: string[] | undefined;
    blockedBy?: string[] | undefined;
    enables?: string[] | undefined;
    references?: string[] | undefined;
    supersedes?: string | undefined;
    supersededBy?: string | undefined;
    fixes?: string | undefined;
    resolvedInto?: string[] | undefined;
    statusHistory?: {
        from: "draft" | "active" | "frozen" | "deprecated";
        to: "draft" | "active" | "frozen" | "deprecated";
        date: string;
        reason?: string | undefined;
    }[] | undefined;
    annotations?: {
        date: string;
        type: string;
        id: string;
        author: string;
        body: string;
    }[] | undefined;
    fieldLocks?: {
        field: string;
        lockedAt: string;
        lockedBy: string;
        reason?: string | undefined;
    }[] | undefined;
    nodeLocked?: boolean | undefined;
}>;
declare const LacEdgeSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    from: string;
    to: string;
    type: string;
}, {
    from: string;
    to: string;
    type: string;
}>;
declare const LacGraphSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<2>;
    project: z.ZodString;
    generated: z.ZodString;
    nodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
        domain: z.ZodString;
        schemaVersion: z.ZodLiteral<2>;
        priority: z.ZodOptional<z.ZodNumber>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        owner: z.ZodOptional<z.ZodString>;
        jira: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        parent: z.ZodOptional<z.ZodString>;
        children: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        blockedBy: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        enables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        references: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        supersedes: z.ZodOptional<z.ZodString>;
        supersededBy: z.ZodOptional<z.ZodString>;
        fixes: z.ZodOptional<z.ZodString>;
        resolvedInto: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        statusHistory: z.ZodOptional<z.ZodArray<z.ZodObject<{
            from: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
            to: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
            date: z.ZodString;
            reason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            from: "draft" | "active" | "frozen" | "deprecated";
            to: "draft" | "active" | "frozen" | "deprecated";
            date: string;
            reason?: string | undefined;
        }, {
            from: "draft" | "active" | "frozen" | "deprecated";
            to: "draft" | "active" | "frozen" | "deprecated";
            date: string;
            reason?: string | undefined;
        }>, "many">>;
        annotations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            author: z.ZodString;
            date: z.ZodString;
            type: z.ZodString;
            body: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            date: string;
            type: string;
            id: string;
            author: string;
            body: string;
        }, {
            date: string;
            type: string;
            id: string;
            author: string;
            body: string;
        }>, "many">>;
        fieldLocks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            lockedAt: z.ZodString;
            lockedBy: z.ZodString;
            reason: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            field: string;
            lockedAt: string;
            lockedBy: string;
            reason?: string | undefined;
        }, {
            field: string;
            lockedAt: string;
            lockedBy: string;
            reason?: string | undefined;
        }>, "many">>;
        nodeLocked: z.ZodOptional<z.ZodBoolean>;
        views: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        status: "draft" | "active" | "frozen" | "deprecated";
        id: string;
        title: string;
        domain: string;
        schemaVersion: 2;
        views: Record<string, Record<string, unknown>>;
        priority?: number | undefined;
        tags?: string[] | undefined;
        owner?: string | undefined;
        jira?: string | string[] | undefined;
        parent?: string | undefined;
        children?: string[] | undefined;
        blockedBy?: string[] | undefined;
        enables?: string[] | undefined;
        references?: string[] | undefined;
        supersedes?: string | undefined;
        supersededBy?: string | undefined;
        fixes?: string | undefined;
        resolvedInto?: string[] | undefined;
        statusHistory?: {
            from: "draft" | "active" | "frozen" | "deprecated";
            to: "draft" | "active" | "frozen" | "deprecated";
            date: string;
            reason?: string | undefined;
        }[] | undefined;
        annotations?: {
            date: string;
            type: string;
            id: string;
            author: string;
            body: string;
        }[] | undefined;
        fieldLocks?: {
            field: string;
            lockedAt: string;
            lockedBy: string;
            reason?: string | undefined;
        }[] | undefined;
        nodeLocked?: boolean | undefined;
    }, {
        type: string;
        status: "draft" | "active" | "frozen" | "deprecated";
        id: string;
        title: string;
        domain: string;
        schemaVersion: 2;
        views: Record<string, Record<string, unknown>>;
        priority?: number | undefined;
        tags?: string[] | undefined;
        owner?: string | undefined;
        jira?: string | string[] | undefined;
        parent?: string | undefined;
        children?: string[] | undefined;
        blockedBy?: string[] | undefined;
        enables?: string[] | undefined;
        references?: string[] | undefined;
        supersedes?: string | undefined;
        supersededBy?: string | undefined;
        fixes?: string | undefined;
        resolvedInto?: string[] | undefined;
        statusHistory?: {
            from: "draft" | "active" | "frozen" | "deprecated";
            to: "draft" | "active" | "frozen" | "deprecated";
            date: string;
            reason?: string | undefined;
        }[] | undefined;
        annotations?: {
            date: string;
            type: string;
            id: string;
            author: string;
            body: string;
        }[] | undefined;
        fieldLocks?: {
            field: string;
            lockedAt: string;
            lockedBy: string;
            reason?: string | undefined;
        }[] | undefined;
        nodeLocked?: boolean | undefined;
    }>, "many">;
    edges: z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        from: string;
        to: string;
        type: string;
    }, {
        from: string;
        to: string;
        type: string;
    }>, "many">;
    meta: z.ZodObject<{
        counts: z.ZodObject<{
            nodes: z.ZodNumber;
            edges: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            nodes: number;
            edges: number;
        }, {
            nodes: number;
            edges: number;
        }>;
        domains: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        counts: {
            nodes: number;
            edges: number;
        };
        domains: string[];
    }, {
        counts: {
            nodes: number;
            edges: number;
        };
        domains: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    schemaVersion: 2;
    project: string;
    generated: string;
    nodes: {
        type: string;
        status: "draft" | "active" | "frozen" | "deprecated";
        id: string;
        title: string;
        domain: string;
        schemaVersion: 2;
        views: Record<string, Record<string, unknown>>;
        priority?: number | undefined;
        tags?: string[] | undefined;
        owner?: string | undefined;
        jira?: string | string[] | undefined;
        parent?: string | undefined;
        children?: string[] | undefined;
        blockedBy?: string[] | undefined;
        enables?: string[] | undefined;
        references?: string[] | undefined;
        supersedes?: string | undefined;
        supersededBy?: string | undefined;
        fixes?: string | undefined;
        resolvedInto?: string[] | undefined;
        statusHistory?: {
            from: "draft" | "active" | "frozen" | "deprecated";
            to: "draft" | "active" | "frozen" | "deprecated";
            date: string;
            reason?: string | undefined;
        }[] | undefined;
        annotations?: {
            date: string;
            type: string;
            id: string;
            author: string;
            body: string;
        }[] | undefined;
        fieldLocks?: {
            field: string;
            lockedAt: string;
            lockedBy: string;
            reason?: string | undefined;
        }[] | undefined;
        nodeLocked?: boolean | undefined;
    }[];
    edges: {
        from: string;
        to: string;
        type: string;
    }[];
    meta: {
        counts: {
            nodes: number;
            edges: number;
        };
        domains: string[];
    };
}, {
    schemaVersion: 2;
    project: string;
    generated: string;
    nodes: {
        type: string;
        status: "draft" | "active" | "frozen" | "deprecated";
        id: string;
        title: string;
        domain: string;
        schemaVersion: 2;
        views: Record<string, Record<string, unknown>>;
        priority?: number | undefined;
        tags?: string[] | undefined;
        owner?: string | undefined;
        jira?: string | string[] | undefined;
        parent?: string | undefined;
        children?: string[] | undefined;
        blockedBy?: string[] | undefined;
        enables?: string[] | undefined;
        references?: string[] | undefined;
        supersedes?: string | undefined;
        supersededBy?: string | undefined;
        fixes?: string | undefined;
        resolvedInto?: string[] | undefined;
        statusHistory?: {
            from: "draft" | "active" | "frozen" | "deprecated";
            to: "draft" | "active" | "frozen" | "deprecated";
            date: string;
            reason?: string | undefined;
        }[] | undefined;
        annotations?: {
            date: string;
            type: string;
            id: string;
            author: string;
            body: string;
        }[] | undefined;
        fieldLocks?: {
            field: string;
            lockedAt: string;
            lockedBy: string;
            reason?: string | undefined;
        }[] | undefined;
        nodeLocked?: boolean | undefined;
    }[];
    edges: {
        from: string;
        to: string;
        type: string;
    }[];
    meta: {
        counts: {
            nodes: number;
            edges: number;
        };
        domains: string[];
    };
}>;
declare const LacIndexEntrySchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
    domain: z.ZodString;
    priority: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: string;
    status: "draft" | "active" | "frozen" | "deprecated";
    id: string;
    title: string;
    domain: string;
    priority?: number | undefined;
    tags?: string[] | undefined;
}, {
    type: string;
    status: "draft" | "active" | "frozen" | "deprecated";
    id: string;
    title: string;
    domain: string;
    priority?: number | undefined;
    tags?: string[] | undefined;
}>;
declare const LacIndexSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<2>;
    project: z.ZodString;
    generated: z.ZodString;
    nodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<["draft", "active", "frozen", "deprecated"]>;
        domain: z.ZodString;
        priority: z.ZodOptional<z.ZodNumber>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        status: "draft" | "active" | "frozen" | "deprecated";
        id: string;
        title: string;
        domain: string;
        priority?: number | undefined;
        tags?: string[] | undefined;
    }, {
        type: string;
        status: "draft" | "active" | "frozen" | "deprecated";
        id: string;
        title: string;
        domain: string;
        priority?: number | undefined;
        tags?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    schemaVersion: 2;
    project: string;
    generated: string;
    nodes: {
        type: string;
        status: "draft" | "active" | "frozen" | "deprecated";
        id: string;
        title: string;
        domain: string;
        priority?: number | undefined;
        tags?: string[] | undefined;
    }[];
}, {
    schemaVersion: 2;
    project: string;
    generated: string;
    nodes: {
        type: string;
        status: "draft" | "active" | "frozen" | "deprecated";
        id: string;
        title: string;
        domain: string;
        priority?: number | undefined;
        tags?: string[] | undefined;
    }[];
}>;
declare const FieldDefSchema: z.ZodObject<{
    type: z.ZodString;
    label: z.ZodString;
    required: z.ZodOptional<z.ZodBoolean>;
    prose: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: string;
    label: string;
    required?: boolean | undefined;
    prose?: boolean | undefined;
}, {
    type: string;
    label: string;
    required?: boolean | undefined;
    prose?: boolean | undefined;
}>;
declare const ViewDefSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        type: z.ZodString;
        label: z.ZodString;
        required: z.ZodOptional<z.ZodBoolean>;
        prose: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        label: string;
        required?: boolean | undefined;
        prose?: boolean | undefined;
    }, {
        type: string;
        label: string;
        required?: boolean | undefined;
        prose?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    description?: string | undefined;
    fields?: Record<string, {
        type: string;
        label: string;
        required?: boolean | undefined;
        prose?: boolean | undefined;
    }> | undefined;
}, {
    id: string;
    label: string;
    description?: string | undefined;
    fields?: Record<string, {
        type: string;
        label: string;
        required?: boolean | undefined;
        prose?: boolean | undefined;
    }> | undefined;
}>;
declare const TypeDefSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    class: z.ZodEnum<["permanent", "absorbing"]>;
    description: z.ZodOptional<z.ZodString>;
    defaultStatus: z.ZodOptional<z.ZodEnum<["draft", "active", "frozen", "deprecated"]>>;
    requiredViews: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    statusTransitions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodEnum<["draft", "active", "frozen", "deprecated"]>, "many">>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    class: "permanent" | "absorbing";
    description?: string | undefined;
    defaultStatus?: "draft" | "active" | "frozen" | "deprecated" | undefined;
    requiredViews?: string[] | undefined;
    statusTransitions?: Record<string, ("draft" | "active" | "frozen" | "deprecated")[]> | undefined;
}, {
    id: string;
    label: string;
    class: "permanent" | "absorbing";
    description?: string | undefined;
    defaultStatus?: "draft" | "active" | "frozen" | "deprecated" | undefined;
    requiredViews?: string[] | undefined;
    statusTransitions?: Record<string, ("draft" | "active" | "frozen" | "deprecated")[]> | undefined;
}>;
declare const LacConfigSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<2>;
    project: z.ZodString;
    extends: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    types: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        class: z.ZodEnum<["permanent", "absorbing"]>;
        description: z.ZodOptional<z.ZodString>;
        defaultStatus: z.ZodOptional<z.ZodEnum<["draft", "active", "frozen", "deprecated"]>>;
        requiredViews: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        statusTransitions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodEnum<["draft", "active", "frozen", "deprecated"]>, "many">>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        class: "permanent" | "absorbing";
        description?: string | undefined;
        defaultStatus?: "draft" | "active" | "frozen" | "deprecated" | undefined;
        requiredViews?: string[] | undefined;
        statusTransitions?: Record<string, ("draft" | "active" | "frozen" | "deprecated")[]> | undefined;
    }, {
        id: string;
        label: string;
        class: "permanent" | "absorbing";
        description?: string | undefined;
        defaultStatus?: "draft" | "active" | "frozen" | "deprecated" | undefined;
        requiredViews?: string[] | undefined;
        statusTransitions?: Record<string, ("draft" | "active" | "frozen" | "deprecated")[]> | undefined;
    }>>>;
    views: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        fields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            label: z.ZodString;
            required: z.ZodOptional<z.ZodBoolean>;
            prose: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            label: string;
            required?: boolean | undefined;
            prose?: boolean | undefined;
        }, {
            type: string;
            label: string;
            required?: boolean | undefined;
            prose?: boolean | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        description?: string | undefined;
        fields?: Record<string, {
            type: string;
            label: string;
            required?: boolean | undefined;
            prose?: boolean | undefined;
        }> | undefined;
    }, {
        id: string;
        label: string;
        description?: string | undefined;
        fields?: Record<string, {
            type: string;
            label: string;
            required?: boolean | undefined;
            prose?: boolean | undefined;
        }> | undefined;
    }>>>;
    index: z.ZodOptional<z.ZodObject<{
        summaryFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        searchFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        summaryFields?: string[] | undefined;
        searchFields?: string[] | undefined;
    }, {
        summaryFields?: string[] | undefined;
        searchFields?: string[] | undefined;
    }>>;
    hub: z.ZodOptional<z.ZodObject<{
        defaultView: z.ZodOptional<z.ZodString>;
        defaultTab: z.ZodOptional<z.ZodString>;
        accentColor: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        defaultView?: string | undefined;
        defaultTab?: string | undefined;
        accentColor?: string | undefined;
    }, {
        defaultView?: string | undefined;
        defaultTab?: string | undefined;
        accentColor?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    schemaVersion: 2;
    views: Record<string, {
        id: string;
        label: string;
        description?: string | undefined;
        fields?: Record<string, {
            type: string;
            label: string;
            required?: boolean | undefined;
            prose?: boolean | undefined;
        }> | undefined;
    }>;
    project: string;
    types: Record<string, {
        id: string;
        label: string;
        class: "permanent" | "absorbing";
        description?: string | undefined;
        defaultStatus?: "draft" | "active" | "frozen" | "deprecated" | undefined;
        requiredViews?: string[] | undefined;
        statusTransitions?: Record<string, ("draft" | "active" | "frozen" | "deprecated")[]> | undefined;
    }>;
    extends?: string[] | undefined;
    index?: {
        summaryFields?: string[] | undefined;
        searchFields?: string[] | undefined;
    } | undefined;
    hub?: {
        defaultView?: string | undefined;
        defaultTab?: string | undefined;
        accentColor?: string | undefined;
    } | undefined;
}, {
    schemaVersion: 2;
    project: string;
    views?: Record<string, {
        id: string;
        label: string;
        description?: string | undefined;
        fields?: Record<string, {
            type: string;
            label: string;
            required?: boolean | undefined;
            prose?: boolean | undefined;
        }> | undefined;
    }> | undefined;
    extends?: string[] | undefined;
    types?: Record<string, {
        id: string;
        label: string;
        class: "permanent" | "absorbing";
        description?: string | undefined;
        defaultStatus?: "draft" | "active" | "frozen" | "deprecated" | undefined;
        requiredViews?: string[] | undefined;
        statusTransitions?: Record<string, ("draft" | "active" | "frozen" | "deprecated")[]> | undefined;
    }> | undefined;
    index?: {
        summaryFields?: string[] | undefined;
        searchFields?: string[] | undefined;
    } | undefined;
    hub?: {
        defaultView?: string | undefined;
        defaultTab?: string | undefined;
        accentColor?: string | undefined;
    } | undefined;
}>;
type LacStatus = z.infer<typeof LacStatusSchema>;
type LacStatusTransition = z.infer<typeof LacStatusTransitionSchema>;
type LacAnnotation = z.infer<typeof LacAnnotationSchema>;
type LacFieldLock = z.infer<typeof LacFieldLockSchema>;
type LacNode = z.infer<typeof LacNodeSchema>;
type LacEdge = z.infer<typeof LacEdgeSchema>;
type LacGraph = z.infer<typeof LacGraphSchema>;
type LacIndexEntry = z.infer<typeof LacIndexEntrySchema>;
type LacIndex = z.infer<typeof LacIndexSchema>;
type LacConfig = z.infer<typeof LacConfigSchema>;
type TypeDef = z.infer<typeof TypeDefSchema>;
type ViewDef = z.infer<typeof ViewDefSchema>;
type FieldDef = z.infer<typeof FieldDefSchema>;

export { type FieldDef, FieldDefSchema, type LacAnnotation, LacAnnotationSchema, type LacConfig, LacConfigSchema, type LacEdge, LacEdgeSchema, type LacFieldLock, LacFieldLockSchema, type LacGraph, LacGraphSchema, type LacIndex, type LacIndexEntry, LacIndexEntrySchema, LacIndexSchema, type LacNode, LacNodeSchema, type LacStatus, LacStatusSchema, type LacStatusTransition, LacStatusTransitionSchema, type TypeDef, TypeDefSchema, type ViewDef, ViewDefSchema };
