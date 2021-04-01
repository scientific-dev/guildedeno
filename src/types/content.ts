export interface Mark{
    data: unknown;
    type: string;
    object: string;
}

export interface Leaf{
    text: string;
    marks: Mark[];
    object: string;
}

export interface NestedNode{
    leaves?: Leaf[];
    object: string;
    data?: unknown;
    type?: string;
    nodes?: NestedNode[];
}

export interface DocumentNode{
    data: Record<string, unknown>;
    type: string;
    nodes: NestedNode[];
    object: string;
}

export interface Document {
    data: unknown;
    nodes?: DocumentNode[];
    object: string;
}

export interface Content {
    object: string;
    document: Document;
}