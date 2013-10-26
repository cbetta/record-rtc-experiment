require "sinatra"
require "uuid"

get "/" do
  erb :index
end

post "/upload" do
  uuid = UUID.generate

  audio_type = params['audio'][:type].split("/").last
  File.open("uploads/#{uuid}.#{audio_type}", "w") do |f|
    f.write(params['audio'][:tempfile].read)
  end

  video_type = params['video'][:type].split("/").last
  File.open("uploads/#{uuid}.#{video_type}", "w") do |f|
    f.write(params['video'][:tempfile].read)
  end

  `ffmpeg -i uploads/#{uuid}.webm uploads/#{uuid}.mp4`
  `ffmpeg -i uploads/#{uuid}.mp4 -i uploads/#{uuid}.wav -c:v copy -c:a aac -strict experimental public/videos/#{uuid}.mp4`

  uuid
end