new=''
mkdir -p ./build
for i in ./src/*
do
    new=`echo $i | sed 's/\.\/src\/\(.*\)jsx/\1js/'`
    ./node_modules/.bin/babel $i > "./build/"$new
done

