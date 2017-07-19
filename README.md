# tweets

### A temporary project, to find the representative tweets of a user.

Web Architecture:

Frontend is designing with AngularJS + Bootstrap, backend server is running on node.js. data visualized in d3.js.

A simple website UML:

<img src="https://github.com/cmuhao/tweets/blob/master/webUML.jpg" align="center"></img>


Web Link:

http://13.59.231.130

or

http://ec2-13-59-231-130.us-east-2.compute.amazonaws.com


To run on local server:

```
git clone https://github.com/cmuhao/tweets.git
cd tweets
npm install
cd bin
node www
```

the server is listening on: http://localhost:3000

## preprocessing
I preprocess and tokenize the text by removing the http link, unrecognized character, stopwords, and some other meaningless words like "RT, &amp", and
username.

## Methods
### lexrank
lexrank method is using graph-based lexical centrality. The lexrank method consider all tweets as one document,
which means it consider relations between sentence, but that is not necessary. And since we don't have labels for
evaluating the result, I'm comparing it with the clustering result.

### clustering

Steps:

1. use ngram (n = 7) to decide the size of features of each sentence.
    1. here I've updated using word2vec to get vector representation of words. then average of Word2Vec vectors with TF-IDF.
    In that case you can skip step 2.
2. use TFIDF to weight each feature of sentence.
3. use k-means (k = 10) to do clustering.
4. after K-means finishes, select the closest sentence (most rep-
resentative sentence) to each centroid for composing the summary.
### test
username: taylorswift13

lexrank result:
```
No.19 RT @ATT: Welcome to the team! @taylorswift13 https://t.co/4h86nLYuLo https://t.co/gAHOi7fPrZ

No.22 RT @AfricanParks: Thank you @TaylorSwift13 for your very generous donation to @AfricanParks on #WorldElephantDay

No.46 Headed to the #iHeartAwards now!!

No.81 The making of the Out of The Woods video, directed by @JosephKahn 🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲 https://t.co/Spc3VNnR8e

No.114 I love you, Sydney. All 76,000 of you. https://t.co/URV3YlAtlT

No.157 RT @NME: Power, fame &amp; the future - the full @taylorswift13 NME cover interview http://t.co/UqEEEffUYl http://t.co/eEt2QkfhKQ

No.159 The making of 'Out of the Woods' and 'I Know Places'. http://t.co/8hBc1Npytb

No.166 RT @billboard: .@TaylorSwift13’s "1989" remains the year’s top-selling album http://t.co/wanbuMxlOq

No.172 RT @billboard: .@TaylorSwift’s #1989 spends a 49th straight week in the #Billboard200 top 10 http://t.co/NidpUChetZ http://t.co/VFsbPBXcyc

No.182 RT @billboard: .@TaylorSwift13 and @TheRyanAdams made history on the #Billboard200 http://t.co/VhCh4uUmEG http://t.co/UNmGsQbu3g
```

clustering result:
```
No.46 Headed to the #iHeartAwards now!!

No.34 BLEACHELLA. https://t.co/TwozyjEsgl

No.192 I LOVED getting to sing The Fix &amp; Hot in Herre with @Nelly_Mo! What a way to end @HAIMtheband's run on the 1989 Tour🔥 http://t.co/xtvGrbVPeU

No.178 RT @KeithUrban: Grease is the word!!! Hey @taylorswift13 - u killed it last nite - thank u for the invite - ridiculous fun!!!!!! - KU http:…

No.77 RT @TheGRAMMYs: .@taylorswift13 calls in (w/@jackantonoff's help) to accept the 1st award at #GRAMMYPremiere https://t.co/9AgLqgsWb5 https:…

No.187 RT @TheRyanAdams: COOL! Me and the #1989 band are on @TheDailyShow today!!! https://t.co/vaCMGLBdry

No.176 Looking good, Toronto. All 50,000 of you. http://t.co/e8WcxcaJlk

No.156 RT @vogueaustralia: First look: @taylorswift13 for Vogue Australia November 2015. http://t.co/6F5eQ2cyl6

No.93 Are we out of the woods yet? #OOTWMusicVideo premieres tomorrow night on @NYRE with @RyanSeacrest! https://t.co/wRLrZeaARh

No.96 I can't wait to show you the video for Out Of The Woods! 🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲 It's premiering 12/31 on @NYRE with @RyanSeacrest. #OOTWMusicVideo
```

we can see the results of two methods are almost different, with only one intersection.

## keywords
Use TFIDF to find the representaive words of all tweets, represented by wordCloud.

<img src = "https://github.com/cmuhao/tweets/blob/master/public/images/word_cloud.png" align = "center"></img>

## References

lexrank:

https://www.cs.cmu.edu/afs/cs/project/jair/pub/volume22/erkan04a-html/erkan04a.html

clustering: 

http://nlp.cic.ipn.mx/Publications/2008/Text%20Summarization%20by%20Sentence%20Extraction%20Using.pdf
