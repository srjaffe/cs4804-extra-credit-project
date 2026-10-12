# AI generated code to merge AI ratings with survey ratings results!!
# Cleans the Google Forms survey export and merges it with the AI ratings
import pandas as pd

SURVEY_FILE = "survey_headlines_ratings.csv"
AI_FILE = "ai_headlines_ratings_summary.csv"

survey = pd.read_csv(SURVEY_FILE)
ai = pd.read_csv(AI_FILE)


# makes headlines match even if quotes or spacing are slightly different
def simplify(text):
    return (text.replace("‘", "'").replace("’", "'").replace("“", '"').replace("”", '"')
                .strip().lower())


headline_to_id = {simplify(h): i for h, i in zip(ai["headline"], ai["id"])}

# give each person a number
survey["participant"] = range(1, len(survey) + 1)

# turn the survey into one row per person per headline
rows = []
for col in survey.columns:
    if col.endswith(" [Bias]"):
        headline = col.replace(" [Bias]", "")
        hid = headline_to_id.get(simplify(headline))
        if hid is None:
            print("Couldn't match headline:", headline)
            continue
        conf_col = headline + " [Confidence]"
        for _, person in survey.iterrows():
            rows.append({
                "participant": person["participant"],
                "id": hid,
                "bias_rating": person[col],
                "confidence": person[conf_col],
            })

ratings = pd.DataFrame(rows)
ratings.to_csv("survey_ratings_long.csv", index=False)
print("Matched", ratings["id"].nunique(), "of", len(ai), "headlines")

# average survey rating for each headline
human = (
    ratings.groupby("id")
    .agg(
        human_bias_mean=("bias_rating", "mean"),
        human_bias_std=("bias_rating", "std"),
        human_conf_mean=("confidence", "mean"),
        n_responses=("participant", "nunique"),
    )
    .reset_index()
)

# combine with the AI summary
summary = ai[["id", "headline", "category", "my_expected", "ai_bias_rating_mean", "ai_bias_rating_std", "ai_confidence_mean"]]
summary = summary.rename(columns={
    "ai_bias_rating_mean": "ai_bias_mean",
    "ai_bias_rating_std": "ai_bias_std",
    "ai_confidence_mean": "ai_conf_mean",
})
summary = summary.merge(human, on="id")
summary["gap"] = summary["ai_bias_mean"] - summary["human_bias_mean"]
summary = summary[["id", "headline", "category", "my_expected", "human_bias_mean", "human_bias_std", "human_conf_mean",
                   "n_responses", "ai_bias_mean", "ai_bias_std", "ai_conf_mean", "gap"]].round(2)
summary.to_csv("headline_summary.csv", index=False)

# one row per person with their background answers and averages
people = survey[["participant",
                 "How often do you read, watch, or listen to the news?",
                 "Where do you get most of your news? (select all that apply)",
                 "How much do you trust the news media in general?",
                 "How often do you use AI tools like ChatGPT, Claude, or Gemini?",
                 "How would you describe your political views?",
                 "What is your age range?"]]
people.columns = ["participant", "news_frequency", "news_sources", "trust_media", "ai_use", "politics", "age"]

ratings = ratings.merge(summary[["id", "ai_bias_mean"]], on="id")
ratings["diff_from_ai"] = (ratings["bias_rating"] - ratings["ai_bias_mean"]).abs()
per_person = (
    ratings.groupby("participant")
    .agg(mean_bias=("bias_rating", "mean"), mean_conf=("confidence", "mean"), mean_diff_from_ai=("diff_from_ai", "mean"))
    .reset_index()
)
participants = people.merge(per_person, on="participant").round(2)
participants.to_csv("participants.csv", index=False)

print("Saved survey_ratings_long.csv, headline_summary.csv, and participants.csv")
print("Responses:", len(survey))