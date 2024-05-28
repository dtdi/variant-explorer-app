from pm4py.llm import openai_query

def abstract_aggregate(aggregate_text: str):
  query = ["Subject: Analyze and Summarize Facts about a Group of Process Mining Cases with Emphasis on the shared and common property values\n"]
  query.append("Text for Analysis:\n\n")

  query.append(aggregate_text)

  query.append("Instructions: Carefully analyze the provided text and produce a summary. Focus on extracting and clearly naming the features that are shared accross all commons. Please provide a brief, concise summary that encapselves all essential elements. The reader knows that you are describing the shared properties of the group. Do not mention this again.\n\n")

  query.append("""Expected Output Format:
Provide one paragraph of text with 50 words that summarizes the group. Refer to the object described in the text as "group". 
Do not make interpretations on the text or the group. Use standard english that is easy to comprehend.
Use the markdown syntax to highlight values and column names if you refer to them in your output.
Start the text by referring to the size of the group (Fraction of total cases) and indicate how the group is the result of a split . 
Do not make a conclusive statement such as "This recurring pattern of attributes across the cases mirrors a standardized procedural adherence within this large subset.""")

  query = "\n".join(query)
  print("XXXXXXX OPENAI QUERY XXXXXXXX")
  result = openai_query(query, api_key='', openai_model='gpt-4-1106-preview')
  return result