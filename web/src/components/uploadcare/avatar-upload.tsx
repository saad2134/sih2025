"use client";

import * as React from "react";
import { Camera, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";

const UPLOADCARE_PUBLIC_KEY = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "fc9f81b71cac15b3392a";
const UPLOADCARE_UPLOAD_URL = "https://upload.uploadcare.com/base/";
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB

/**
 * Extracts the UUID from an Uploadcare CDN URL.
 * e.g. "https://ucarecdn.com/abc123-def456/" → "abc123-def456"
 */
export function extractUploadcareUUID(url: string): string | null {
    if (!url) return null;
    const match = url.match(/ucarecdn\.com\/([a-f0-9-]{36})/i);
    return match ? match[1] : null;
}

/**
 * Builds an optimized Uploadcare CDN URL with smart resize + auto format/quality.
 */
export function buildOptimizedUrl(uuid: string, size = 200): string {
    return `https://ucarecdn.com/${uuid}/-/smart_resize/${size}x${size}/-/format/auto/-/quality/smart/`;
}

export interface AvatarUploadProps {
    /** Current avatar URL (CDN or null) */
    currentUrl?: string | null;
    /** User initials to show as fallback */
    initials?: string;
    /** Called when a new file has been uploaded. Receives (cdnUrl, fileUuid). */
    onUploadComplete: (cdnUrl: string, fileUuid: string) => void;
    /** Called when the avatar is removed locally (does NOT delete from Uploadcare — that happens on save) */
    onRemove?: () => void;
    /** Size of the circular avatar in pixels. Defaults to 96. */
    size?: number;
    className?: string;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function AvatarUpload({
    currentUrl,
    initials = "ST",
    onUploadComplete,
    onRemove,
    size = 96,
    className = "",
}: AvatarUploadProps) {
    const [preview, setPreview] = React.useState<string | null>(null);
    const [uploadState, setUploadState] = React.useState<UploadState>("idle");
    const [progress, setProgress] = React.useState(0);
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Determine displayed image
    const displayUrl = preview ?? currentUrl ?? null;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset
        setError(null);

        // Validate type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Only JPG, PNG, GIF, and WebP images are allowed.");
            e.target.value = "";
            return;
        }

        // Validate size
        if (file.size > MAX_SIZE_BYTES) {
            setError("File is too large. Maximum size is 3 MB.");
            e.target.value = "";
            return;
        }

        // Show local preview immediately
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Upload to Uploadcare
        setUploadState("uploading");
        setProgress(0);

        try {
            // Fetch secure upload signature from backend first
            let signature = "";
            let expire = 0;
            try {
                const sigRes = await apiService.getUploadSignature();
                if (sigRes.success && sigRes.data) {
                    signature = sigRes.data.signature;
                    expire = sigRes.data.expire;
                } else {
                    throw new Error("Failed to generate upload signature");
                }
            } catch (err) {
                console.error("Signature fetch failed", err);
                throw new Error("Could not authorize upload. Please try again.");
            }

            const formData = new FormData();
            formData.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUBLIC_KEY);
            formData.append("UPLOADCARE_STORE", "1"); // auto-store
            formData.append("signature", signature);
            formData.append("expire", expire.toString());
            formData.append("file", file);

            // Use XMLHttpRequest so we can track upload progress
            const uuid = await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", UPLOADCARE_UPLOAD_URL);

                xhr.upload.addEventListener("progress", (ev) => {
                    if (ev.lengthComputable) {
                        setProgress(Math.round((ev.loaded / ev.total) * 100));
                    }
                });

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            resolve(data.file); // file = UUID
                        } catch {
                            reject(new Error("Invalid response from Uploadcare"));
                        }
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error("Network error during upload"));
                xhr.send(formData);
            });

            const optimizedUrl = buildOptimizedUrl(uuid);
            setUploadState("success");
            setProgress(100);
            onUploadComplete(optimizedUrl, uuid);
        } catch (err) {
            console.error("Uploadcare upload failed", err);
            setError("Upload failed. Please try again.");
            setUploadState("error");
            setPreview(null);
        } finally {
            e.target.value = "";
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setUploadState("idle");
        setError(null);
        setProgress(0);
        onRemove?.();
    };

    const circumference = 2 * Math.PI * (size / 2 - 3);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            <div className="relative" style={{ width: size, height: size }}>
                {/* Progress ring */}
                {uploadState === "uploading" && (
                    <svg
                        className="absolute inset-0 -rotate-90 z-10"
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                    >
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={size / 2 - 3}
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="4"
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={size / 2 - 3}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-300"
                        />
                    </svg>
                )}

                {/* Avatar circle */}
                <div
                    className="w-full h-full rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center overflow-hidden border-2 border-border"
                    style={{ width: size, height: size }}
                >
                    {displayUrl ? (
                        <img
                            src={displayUrl}
                            alt="Profile photo"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span
                            className="font-bold text-violet-600 dark:text-violet-400 select-none"
                            style={{ fontSize: size * 0.33 }}
                        >
                            {initials}
                        </span>
                    )}
                </div>

                {/* Hover camera overlay (not shown during upload) */}
                {uploadState !== "uploading" && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Change profile photo"
                    >
                        <Camera className="text-white" style={{ width: size * 0.28, height: size * 0.28 }} />
                    </button>
                )}

                {/* Status overlay during upload */}
                {uploadState === "uploading" && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <Loader2 className="text-white animate-spin" style={{ width: size * 0.28, height: size * 0.28 }} />
                    </div>
                )}

                {/* Success tick */}
                {uploadState === "success" && (
                    <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-0.5">
                        <CheckCircle2 className="text-white w-4 h-4" />
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                className="sr-only"
                onChange={handleFileSelect}
                aria-label="Upload profile photo"
            />

            {/* Action buttons */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploadState === "uploading"}
                    className="text-xs h-8"
                >
                    <Camera className="w-3 h-3 mr-1.5" />
                    {displayUrl ? "Change Photo" : "Add Photo"}
                </Button>
                {displayUrl && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        disabled={uploadState === "uploading"}
                        className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="w-3 h-3 mr-1.5" />
                        Remove
                    </Button>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-1.5 text-xs text-destructive max-w-[200px] text-center">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <p className="text-xs text-muted-foreground text-center max-w-[180px]">
                JPG, PNG, GIF or WebP · Max 3 MB
            </p>
        </div>
    );
}
