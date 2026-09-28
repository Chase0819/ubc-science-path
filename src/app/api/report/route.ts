import { isReportPageId, REPORT_PAGE_LABEL, reportSubject, type ReportPageId } from "@/lib/report";

const REPORT_TO = "chasewu0819@gmail.com";
const MAX_MESSAGE = 4000;

type ReportBody = {
  page?: unknown;
  message?: unknown;
  honey?: unknown;
};

export async function POST(request: Request) {
  let body: ReportBody;
  try {
    body = (await request.json()) as ReportBody;
  } catch {
    return Response.json({ ok: false, error: "Could not read the report." }, { status: 400 });
  }

  if (typeof body.honey === "string" && body.honey.trim()) {
    return Response.json({ ok: true });
  }

  const page = typeof body.page === "string" ? body.page : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!isReportPageId(page)) {
    return Response.json({ ok: false, error: "Pick the page that has the problem." }, { status: 400 });
  }
  if (message.length < 8) {
    return Response.json(
      { ok: false, error: "Write a bit more about what went wrong." },
      { status: 400 },
    );
  }
  if (message.length > MAX_MESSAGE) {
    return Response.json({ ok: false, error: "Keep the report under 4,000 characters." }, { status: 400 });
  }

  const sent = await sendReport(page, message);
  if (!sent.ok) {
    return Response.json(
      { ok: false, error: sent.error, mailto: mailtoHref(page, message) },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, pendingConfirm: sent.pendingConfirm === true });
}

function mailtoHref(page: ReportPageId, message: string) {
  const subject = encodeURIComponent(reportSubject(page));
  const body = encodeURIComponent(`Page: ${REPORT_PAGE_LABEL[page]}\n\n${message}`);
  return `mailto:${REPORT_TO}?subject=${subject}&body=${body}`;
}

async function sendReport(
  page: ReportPageId,
  message: string,
): Promise<{ ok: true; pendingConfirm?: boolean } | { ok: false; error: string }> {
  try {
    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    const response = await fetch(`https://formsubmit.co/ajax/${REPORT_TO}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin,
        Referer: `${origin}/report`,
      },
      body: JSON.stringify({
        _subject: reportSubject(page),
        _template: "table",
        _captcha: "false",
        page: REPORT_PAGE_LABEL[page],
        message,
      }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { success?: string | boolean; message?: string }
      | null;
    const success =
      payload?.success === true || payload?.success === "true" || response.ok;
    if (!success) {
      return {
        ok: false,
        error: "The report did not send. Try again, or open your mail app.",
      };
    }
    const note = (payload?.message ?? "").toLowerCase();
    const pendingConfirm =
      note.includes("confirm") || note.includes("activate") || note.includes("activation");
    return { ok: true, pendingConfirm };
  } catch {
    return {
      ok: false,
      error: "The report did not send. Try again, or open your mail app.",
    };
  }
}
