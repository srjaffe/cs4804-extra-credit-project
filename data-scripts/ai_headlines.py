import os
import json
import re
import random
import time
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

DRY_RUN = False
MODEL = "gemini-3.8-flash"
N_RUNS = 3
WAIT = 2
RAW_FILE = "dry_run_raw.csv" if DRY_RUN else "ai_headlines_ratings_raw.csv"
SUMMARY_FILE = "dry_run_summary.csv" if DRY_RUN else "ai_headlines_ratings_summary.csv"

INSTRUCTIONS = """For each headline, you'll answer two questions:

Bias rating: How much does the wording of this headline push the reader toward an opinion or emotional reaction, rather than just stating facts?
1 = Not at all (purely factual) 
2 = Slightly
3 = Moderately
4 = Strongly
5 = Extremely

Confidence: How confident are you in your bias rating?
1 = Not at all confident
2 = Slightly confident
3 = Moderately confident
4 = Very confident
5 = Extremely confident

Please judge the wording of the headline itself, not whether you agree with it or whether you think the story is important. Go with your first impression, and please don't look the headlines up."""

FORMAT = 'Respond with only a json object like this: {"bias_rating": 1-5, "confidence": 1-5, "explanation": "one short sentence"}'

if not DRY_RUN:
    from google import genai
    client = genai.Client()

def rate(headline):
    if DRY_RUN:
        return {"bias_rating": random.randint(1, 5), "confidence": random.randint(1, 5), "explanation": "This is a dry run, so the ratings are random."}

    prompt = f"{INSTRUCTIONS}\n\nHeadline: \"{headline}\"\n\n{FORMAT}"
    response = client.models.generate_content(model=MODEL, contents=prompt)
    text = response.text
    data = json.loads(re.search(r"\{.*\}", text, re.DOTALL).group())
    return data

df = pd.read_csv("headlines.csv")
rows = []
done = set()
if os.path.exists(RAW_FILE) and not DRY_RUN:
    old = pd.read_csv(RAW_FILE).dropna(subset=["bias_rating"])
    old = old[old["run"] <= N_RUNS]
    rows = old.to_dict("records")
    done = set(zip(old["id"], old["run"]))
    print(f"Resuming from {len(rows)} completed ratings, {len(done)} unique (id, run) pairs.")

for _, h in df.iterrows():
    for run in range(1, N_RUNS + 1):
        if (h["id"], run) in done:
            continue
        result = None
        for attempt in range(3):
            try:
                result = rate(h["headline"])
                break
            except Exception as e:
                print(f"Error rating headline '{h['headline']}': {e}. Retrying...")
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e) or "503" in str(e) or "UNAVAILABLE" in str(e):
                    time.sleep(60)
                else:
                    time.sleep(5)
                

        if result is None:
            result = {"bias_rating": None, "confidence": None, "explanation": "Failed to get a rating after 3 attempts."}

        rows.append({
            "id": h["id"],
            "category": h["category"],
            "run": run,
            "bias_rating": result["bias_rating"],
            "confidence": result["confidence"],
            "explanation": result["explanation"]
        })
        print(h["id"], "run", run, "bias_rating:", result["bias_rating"], "confidence:", result["confidence"])

        pd.DataFrame(rows).to_csv(RAW_FILE, index=False)

        if not DRY_RUN:
            time.sleep(WAIT)

raw = pd.DataFrame(rows)
raw.to_csv(RAW_FILE, index=False)

summary = (
    raw.groupby(["id", "category"])
    .agg(
        ai_bias_rating_mean=("bias_rating", "mean"),
        ai_bias_rating_std=("bias_rating", "std"),
        ai_bias_rating_min=("bias_rating", "min"),
        ai_bias_rating_max=("bias_rating", "max"),
        ai_confidence_mean=("confidence", "mean"),
        ai_confidence_std=("confidence", "std"),
    )
    .reset_index()
    .round(2)
)
summary = df[["id", "headline", "my_expected"]].merge(summary, on="id")
summary.to_csv(SUMMARY_FILE, index=False)

print(f"Done! Raw ratings saved to {RAW_FILE}, summary saved to {SUMMARY_FILE}")
print(f"Failed ratings: {raw['bias_rating'].isna().sum()}")