"use client";

import { useState } from "react";
import { REPORT_PAGES, type ReportPageId } from "@/lib/report";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; pendingConfirm: boolean }
  | { kind: "error"; message: string; mailto?: string };

export function ReportForm() {
  const [page, setPage] = useState<ReportPageId | "">("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!page) {
      setStatus({ kind: "error", message: "Pick the page that has the problem." });
      return;
    }
    if (message.trim().length < 8) {
      setStatus({ kind: "error", message: "Write a bit more about what went wrong." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, message: message.trim(), honey }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; mailto?: string; pendingConfirm?: boolean }
        | null;
      if (!response.ok || !payload?.ok) {
        setStatus({
          kind: "error",
          message: payload?.error ?? "The report did not send.",
          mailto: payload?.mailto,
        });
        return;
      }
      setStatus({ kind: "sent", pendingConfirm: payload.pendingConfirm === true });
    } catch {
      setStatus({ kind: "error", message: "The report did not send. Check your connection." });
    }
  }

  if (status.kind === "sent") {
    return (
      <section className="rounded-[28px] border-2 border-[#142033] bg-white p-6 shadow-[4px_4px_0_#142033] sm:p-7">
        <p className="text-sm font-bold text-[#6b3fa0]">Sent</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight">Thanks — the report is on its way.</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          {status.pendingConfirm
            ? "The first report asks the inbox to confirm. After that click, later reports land in Gmail."
            : "It was emailed to the student who built this site, not to UBC."}
        </p>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setPage("");
            setStatus({ kind: "idle" });
          }}
          className="mt-5 rounded-full border-2 border-[#142033] bg-[#e4d4f4] px-5 py-2.5 text-sm font-bold shadow-[3px_3px_0_#142033]"
        >
          Send another
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-bold text-[var(--muted)]">Which page?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {REPORT_PAGES.map((item) => {
            const on = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                aria-pressed={on}
                className={`rounded-[28px] border-2 border-[#142033] p-4 text-left shadow-[4px_4px_0_#142033] ${
                  on ? item.color : "bg-white"
                }`}
              >
                <p className="text-lg font-black tracking-tight">{item.label}</p>
                <p className={`mt-1 text-sm font-medium ${on ? "opacity-80" : "text-[var(--muted)]"}`}>
                  {item.hint}
                </p>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="grid gap-1 text-sm font-bold">
        What happened?
        <textarea
          className="min-h-40 w-full rounded-[24px] border-2 border-[#142033] bg-white px-4 py-3 text-base font-medium leading-7 outline-none"
          placeholder="What you tapped, what you expected, and what went wrong."
          value={message}
          maxLength={4000}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>

      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <input
          tabIndex={-1}
          autoComplete="off"
          value={honey}
          onChange={(event) => setHoney(event.target.value)}
        />
      </div>

      {status.kind === "error" ? (
        <p className="rounded-2xl border-2 border-[#142033] bg-[#f8d0d0] px-4 py-3 text-sm font-medium leading-6">
          {status.message}
          {status.mailto ? (
            <>
              {" "}
              <a href={status.mailto} className="font-bold underline">
                Open a mail draft instead
              </a>
              .
            </>
          ) : null}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="rounded-full border-2 border-[#142033] bg-[#e4d4f4] px-6 py-2.5 text-sm font-bold shadow-[3px_3px_0_#142033] disabled:opacity-50"
      >
        {status.kind === "sending" ? "Sending…" : "Report"}
      </button>
    </form>
  );
}
